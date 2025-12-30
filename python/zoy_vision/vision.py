import cv2
import sys
import os
import mediapipe as mp
import time

# --- Configuração de Logs do TensorFlow (Limpeza visual) ---
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

# --- Variáveis Globais Coordenada x/y do mouse---
mouse_x = 0
mouse_y = 0

# --- Controle de Estado e Tempo (Anti-Flood) ---
# Armazena o último comando enviado por zona
last_commands = {
    "left_up": None,
    "left_down": None,
    "right_up": None,
    "right_down": None,
    "center": None
}

# Armazena o timestamp do último envio por zona
last_send_time = {
    "left_up": 0,
    "left_down": 0,
    "right_up": 0,
    "right_down": 0,
    "center": 0
}

# Tempo mínimo entre comandos para a mesma zona (em segundos)
# Aumente se o Arduino ainda estiver travando (ex: 0.3 ou 0.5)
COMMAND_COOLDOWN = 0.2 

def mouse_callback(event, x, y, flags, param):
    """
    Atualiza as variáveis globais com a posição atual do mouse.
    """
    global mouse_x, mouse_y
    if event == cv2.EVENT_MOUSEMOVE:
        mouse_x = x
        mouse_y = y

def start_camera():
    """
    Tenta abrir a primeira câmera disponível.
    """
    for i in range(3):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            print(f"Câmera aberta no índice {i}")
            return cap
    raise Exception("Não foi possível abrir a câmera")

# Função auxiliar: envia o comando serial através do stdout para o Electron
def send_serial_command(command):
    sys.stdout.write(f"SERIAL_CMD:{command}\n")
    sys.stdout.flush()

# --- LÓGICA DO MEDIAPIPE ---

def count_fingers(hand_landmarks):
    """
    Conta quais dedos estão levantados.
    Retorna uma lista de booleans [Dedão, Indicador, Médio, Anelar, Mindinho]
    e o total de dedos levantados.
    """
    fingers = []
    
    # Pontos de referência dos dedos (Tip = Ponta, Pip/Mcp = Juntas)
    # Dedão (4) vs (3) - Lógica depende da mão (esquerda/direita), 
    # mas para simplificar vamos usar a coordenada X relativa ao ponto 3.
    # OBS: Como espelhamos a imagem, a lógica de esquerda/direita inverte.
    # Vamos usar uma lógica simplificada baseada na posição X da ponta vs a junta.
    
    # Para o Dedão, verificamos se a ponta (4) está mais "para fora" que a junta (3)
    # Essa lógica simples pode falhar dependendo da rotação, mas funciona para palma aberta de frente.
    if hand_landmarks.landmark[4].x < hand_landmarks.landmark[3].x:
        fingers.append(1) # Dedão "aberto" (lógica simplificada)
    else:
        fingers.append(0)

    # Outros 4 dedos: Ponta (y) < Junta (y) (Lembrando que Y=0 é o topo)
    tips = [8, 12, 16, 20] # Indicador, Médio, Anelar, Mindinho
    pips = [6, 10, 14, 18] # Juntas inferiores
    
    for tip, pip in zip(tips, pips):
        if hand_landmarks.landmark[tip].y < hand_landmarks.landmark[pip].y:
            fingers.append(1)
        else:
            fingers.append(0)
    return fingers, sum(fingers)

def detect_gesture(fingers_list, total_fingers):
    """
    Identifica o gesto com base nos dedos levantados.
    """
    # Punho Fechado: 0 dedos ou apenas dedão (tolerância)
    if total_fingers == 0 or (total_fingers == 1 and fingers_list[0] == 1):
        return "FECHADA"
    
    # Mão Aberta: 4 ou 5 dedos
    if total_fingers >= 4:
        return "ABERTA"
    # V: Indicador ON (ignora dedão), Resto dos dedos OFF
    if fingers_list[1] == 1 and fingers_list[2] == 0 and fingers_list[3] == 0 and fingers_list[4] == 0:
        return "INDICADOR"
    return "INDEFINIDO"

def process_zone_logic(cx, cy, gesture, width, height, left_bound, right_bound):
    """
    Determina em qual zona a mão está e retorna o comando apropriado.
    """
    mid_height = height // 2
    command = None
    zone_name = None

    # 1. ZONA CENTRAL (Prioridade Máxima para PARAR)
    if left_bound < cx < right_bound:
        zone_name = "center"
        if gesture == "ABERTA":
            return "center", ["<PARAR:0,0>", "<LED_LEFT:LOW>", "<LED_RIGHT:LOW>"]

    # 2. ESQUERDA
    elif cx < left_bound:
        if cy < mid_height: # Cima
            zone_name = "left_up"
            if gesture == "FECHADA": command = "<LED_LEFT:HIGH>"
            elif gesture == "ABERTA": command = "<LED_LEFT:LOW>"
        else: # Baixo
            zone_name = "left_down"
            if gesture == "FECHADA": command = "<MOTOR_ESQUERDO_FRENTE:80>"
            elif gesture == "ABERTA": command = "<PARAR_ESQUERDO:>"
            elif gesture == "INDICADOR": command = "<MOTOR_ESQUERDO_TRAS:80>"

    # 3. DIREITA
    elif cx > right_bound:
        if cy < mid_height: # Cima
            zone_name = "right_up"
            if gesture == "FECHADA": command = "<LED_RIGHT:HIGH>"
            elif gesture == "ABERTA": command = "<LED_RIGHT:LOW>"
        else: # Baixo
            zone_name = "right_down"
            if gesture == "FECHADA": command = "<MOTOR_DIREITO_FRENTE:80>"
            elif gesture == "ABERTA": command = "<PARAR_DIREITO:>"
            elif gesture == "INDICADOR": command = "<MOTOR_DIREITO_TRAS:80>"
            
    return zone_name, command

def main():
    global mouse_x, mouse_y, last_commands, last_send_time
    
    cap = start_camera()

    # --- INICIALIZAÇÃO MEDIAPIPE ---
    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    # max_num_hands=2 para detectar as duas mãos
    hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.5, max_num_hands=2)
    # -------------------------------

    # Configuração da Janela
    window_name = "Zoy Vision Quadrantes"
    cv2.namedWindow(window_name)
    cv2.setMouseCallback(window_name, mouse_callback)

    try:
        while True:
            ret, frame = cap.read()
            if not ret: break

            # Espelhamento (Flip)
            frame = cv2.flip(frame, 1)
            height, width, _ = frame.shape
            
            # Limites
            left_bound = width // 3
            right_bound = 2 * width // 3
            mid_height = height // 2

            img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(img_rgb)

            if results.multi_hand_landmarks:
                for hand_lms in results.multi_hand_landmarks:
                    # Desenhar esqueleto da mão
                    mp_draw.draw_landmarks(frame, hand_lms, mp_hands.HAND_CONNECTIONS)

                    # Contar dedos e identificar gesto
                    fingers_list, total_fingers = count_fingers(hand_lms)
                    gesture = detect_gesture(fingers_list, total_fingers)

                    # Ponto central da mão (base do dedo médio)
                    cx, cy = int(hand_lms.landmark[9].x * width), int(hand_lms.landmark[9].y * height)
                    
                    # Desenhar gesto e ponto
                    cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                    cv2.putText(frame, gesture, (cx - 30, cy - 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                    # --- LÓGICA DE ENVIO COM COOLDOWN ---
                    zone_name, command = process_zone_logic(cx, cy, gesture, width, height, left_bound, right_bound)

                    if zone_name and command:
                        current_time = time.time()
                        
                        # Verifica se mudou o comando OU se já passou tempo suficiente desde o último envio
                        # Nota: Adicionei "Mudança de comando" como gatilho imediato, 
                        # mas se for o MESMO comando, espera o cooldown para reenviar (keep-alive) ou ignora.
                        
                        is_new_command = last_commands[zone_name] != str(command)
                        is_cooldown_passed = (current_time - last_send_time[zone_name]) > COMMAND_COOLDOWN

                        # Só envia se for um comando novo (prioridade) OU se for o mesmo comando mas passou o tempo (opcional)
                        # Aqui vou configurar para enviar APENAS se o comando mudar, para limpar o buffer do Arduino.
                        
                        if is_new_command and is_cooldown_passed:
                            if isinstance(command, list):
                                # Sequencia do centro
                                for cmd in command:
                                    send_serial_command(cmd)
                                last_commands[zone_name] = "SEQUENCE_SENT"
                            else:
                                send_serial_command(command)
                                last_commands[zone_name] = command
                            
                            last_send_time[zone_name] = current_time

            # --- VISUALIZAÇÃO (Linhas e Texto) ---
            # cv2.line(imagem, ponto_inicial, ponto_final, cor_BGR, espessura)
            cv2.line(frame, (left_bound, 0), (left_bound, height), (255, 0, 0), 2)
            cv2.line(frame, (right_bound, 0), (right_bound, height), (255, 0, 0), 2)
            cv2.line(frame, (0, mid_height), (left_bound, mid_height), (255, 0, 0), 1)
            cv2.line(frame, (right_bound, mid_height), (width, mid_height), (255, 0, 0), 1)

            # cv2.putText(imagem, texto, posicao, fonte, tamanho_fonte, cor_BGR, espessura)
            cv2.putText(frame, "ESQ-CIMA", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (123, 0, 255), 1)
            cv2.putText(frame, "ESQ-BAIXO", (10, mid_height + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (123, 0, 255), 1)
            cv2.putText(frame, "DIR-CIMA", (right_bound + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (123, 0, 255), 1)
            cv2.putText(frame, "DIR-BAIXO", (right_bound + 10, mid_height + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (123, 0, 255), 1)
            cv2.putText(frame, "CENTRO", (left_bound + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (123, 0, 255), 1)

            # --- INFORMAÇÃO DO MOUSE (Y Invertido) ---
            inverted_y = height - mouse_y
            cv2.rectangle(frame, (mouse_x + 10, mouse_y - 25), (mouse_x + 130, mouse_y - 5), (153, 150, 125), -1)
            cv2.putText(frame, f"X:{mouse_x} Y:{inverted_y}", (mouse_x + 15, mouse_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (216, 109, 39), 2)

            cv2.imshow(window_name, frame)

            # Verifica se a janela foi fechada ou 'q' pressionado
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            try:
                if cv2.getWindowProperty(window_name, cv2.WND_PROP_VISIBLE) < 1:
                    break
            except cv2.error:
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("Encerrado com segurança.")

if __name__ == "__main__":
    main()