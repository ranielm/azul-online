export type Language = 'pt-BR' | 'en-US';

export const translations = {
  'pt-BR': {
    // Home
    title: 'Azul Online',
    subtitle: 'Jogue o clássico jogo de tabuleiro com amigos',
    createRoom: 'Criar Sala',
    joinRoom: 'Entrar na Sala',
    noAccountNeeded: 'Sem necessidade de conta. Basta compartilhar o código!',
    players: 'jogadores',

    // Create Room
    createRoomTitle: 'Criar Sala',
    yourName: 'Seu Nome',
    enterYourName: 'Digite seu nome',
    maxPlayers: 'Máximo de Jogadores',
    playersCount: 'Jogadores',
    back: 'Voltar',

    // Join Room
    joinRoomTitle: 'Entrar na Sala',
    roomCode: 'Código da Sala',
    enterRoomCode: 'Digite o código da sala',

    // Lobby
    waitingRoom: 'Sala de Espera',
    copyLink: 'Copiar Link',
    copied: 'Copiado!',
    playersList: 'Jogadores',
    you: 'Você',
    host: 'ANFITRIÃO',
    waitingForPlayer: 'Aguardando jogador...',
    startGame: 'Iniciar Jogo',
    needMorePlayers: (n: number) => `Precisa de mais ${n} jogador(es)`,
    hostCanStart: 'Como anfitrião, só você pode iniciar o jogo',
    waitingForHost: 'Aguardando o anfitrião iniciar o jogo...',
    leaveRoom: 'Sair da Sala',

    // Game
    round: 'Rodada',
    yourTurn: 'É a sua vez!',
    playerTurn: (name: string) => `Vez de ${name}`,
    selected: 'Selecionado',
    tiles: 'peças',
    from: 'de',
    factory: 'Fábrica',
    center: 'Centro',
    cancelSelection: 'Cancelar seleção',
    patternLines: 'LINHAS DE PADRÃO',
    wall: 'PAREDE',
    floorPenalties: 'CHÃO (PENALIDADES)',
    pts: 'pts',
    playing: 'Jogando...',
    factories: 'FÁBRICAS',

    // Game Over
    youWon: 'Você Venceu!',
    gameOver: 'Fim de Jogo',
    congratulations: 'Parabéns pela vitória!',
    playerWins: (name: string) => `${name} venceu o jogo!`,
    finalScores: 'Pontuação Final',
    playAgain: 'Jogar Novamente',
    waitingForRestart: 'Aguardando o anfitrião reiniciar...',

    // Connection
    connectingToServer: 'Conectando ao servidor...',

    // Language
    language: 'Idioma',

    // Board
    selectWherePlaceTiles: 'Selecione onde colocar as peças',
    yourTurnSelectTiles: 'Sua vez - selecione as peças',
    noValidPatternLines: 'Nenhuma linha de padrão válida - deve colocar no chão',

    // Auth
    quickPlay: 'Jogar Rápido',
    loginRegister: 'Entrar / Cadastrar',
    nickname: 'Apelido',
    enterNickname: 'Digite seu apelido',
    email: 'Email',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    username: 'Nome de Usuário',
    usernamePlaceholder: 'jogador123',
    login: 'Entrar',
    signUp: 'Cadastrar',
    logout: 'Sair',
    loggedIn: 'Conectado',
    noAccount: 'Não tem uma conta?',
    alreadyHaveAccount: 'Já tem uma conta?',
    loading: 'Carregando...',
    continue: 'Continuar',
    createAccount: 'Criar Conta',
    chooseYourAvatar: 'Escolha seu Avatar',
    avatarDescription: 'Faça upload de uma imagem para personalizar seu perfil de jogador',
    skipForNow: 'Pular por enquanto',
    passwordsMustMatch: 'As senhas devem ser iguais',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',

    // Game Controls
    enterFullscreen: 'Tela Cheia',
    exitFullscreen: 'Sair da Tela Cheia',
    leaveGame: 'Sair do Jogo',
    leaveGameTitle: 'Abandonar Partida?',
    leaveGameMessage: 'Tem certeza que deseja abandonar esta partida? Seu progresso será perdido.',
    stay: 'Ficar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
  },
  'en-US': {
    // Home
    title: 'Azul Online',
    subtitle: 'Play the classic board game with friends',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    noAccountNeeded: 'No account needed. Just share the room code!',
    players: 'players',

    // Create Room
    createRoomTitle: 'Create Room',
    yourName: 'Your Name',
    enterYourName: 'Enter your name',
    maxPlayers: 'Max Players',
    playersCount: 'Players',
    back: 'Back',

    // Join Room
    joinRoomTitle: 'Join Room',
    roomCode: 'Room Code',
    enterRoomCode: 'Enter room code',

    // Lobby
    waitingRoom: 'Waiting Room',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    playersList: 'Players',
    you: 'You',
    host: 'HOST',
    waitingForPlayer: 'Waiting for player...',
    startGame: 'Start Game',
    needMorePlayers: (n: number) => `Need ${n} more player(s)`,
    hostCanStart: 'As the host, only you can start the game',
    waitingForHost: 'Waiting for host to start the game...',
    leaveRoom: 'Leave Room',

    // Game
    round: 'Round',
    yourTurn: "It's your turn!",
    playerTurn: (name: string) => `${name}'s turn`,
    selected: 'Selected',
    tiles: 'tiles',
    from: 'from',
    factory: 'Factory',
    center: 'Center',
    cancelSelection: 'Cancel selection',
    patternLines: 'PATTERN LINES',
    wall: 'WALL',
    floorPenalties: 'FLOOR (PENALTIES)',
    pts: 'pts',
    playing: 'Playing...',
    factories: 'FACTORIES',

    // Game Over
    youWon: 'You Won!',
    gameOver: 'Game Over',
    congratulations: 'Congratulations on your victory!',
    playerWins: (name: string) => `${name} wins the game!`,
    finalScores: 'Final Scores',
    playAgain: 'Play Again',
    waitingForRestart: 'Waiting for host to restart...',

    // Connection
    connectingToServer: 'Connecting to server...',

    // Language
    language: 'Language',

    // Board
    selectWherePlaceTiles: 'Select where to place tiles',
    yourTurnSelectTiles: 'Your turn - select tiles',
    noValidPatternLines: 'No valid pattern lines - must place on floor',

    // Auth
    quickPlay: 'Quick Play',
    loginRegister: 'Login / Register',
    nickname: 'Nickname',
    enterNickname: 'Enter your nickname',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    usernamePlaceholder: 'player123',
    login: 'Login',
    signUp: 'Sign Up',
    logout: 'Logout',
    loggedIn: 'Logged in',
    noAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    loading: 'Loading...',
    continue: 'Continue',
    createAccount: 'Create Account',
    chooseYourAvatar: 'Choose Your Avatar',
    avatarDescription: 'Upload an image to customize your player profile',
    skipForNow: 'Skip for now',
    passwordsMustMatch: 'Passwords must match',
    passwordTooShort: 'Password must be at least 6 characters',

    // Game Controls
    enterFullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    leaveGame: 'Leave Game',
    leaveGameTitle: 'Leave Match?',
    leaveGameMessage: 'Are you sure you want to abandon this match? Your progress will be lost.',
    stay: 'Stay',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
} as const;

export type TranslationKey = keyof typeof translations['en-US'];
