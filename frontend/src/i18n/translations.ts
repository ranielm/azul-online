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
    playingAs: 'Jogando como:',

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

    // Change Room Code
    changeCode: 'Mudar Código',
    changeCodeTitle: 'Mudar Código da Sala',
    newRoomCode: 'Novo Código',
    enterNewRoomCode: 'Digite o novo código (6 caracteres)',
    changeCodeDescription: 'Digite um novo código de 6 caracteres (letras e números)',
    codeChanged: 'Código alterado!',
    invalidCode: 'Código inválido. Use 6 caracteres alfanuméricos.',

    // Penalty Notifications
    penaltyOverflow: (name: string, count: number) =>
      `${name} colocou ${count} peça(s) no chão (linha cheia)`,
    penaltyFloorChoice: (name: string, count: number) =>
      `${name} colocou ${count} peça(s) no chão`,
    penaltyFirstPlayer: (name: string) =>
      `${name} pegou o marcador de primeiro jogador (-1)`,
    penalty: 'Penalidade',

    // Round Summary
    roundSummary: 'Resumo da Rodada',
    roundComplete: (n: number) => `Rodada ${n} Completa!`,
    tilesPlaced: 'Peças na Parede',
    wallBonus: 'Bônus de Adjacência',
    floorPenalty: 'Penalidade do Chão',
    roundPoints: 'Pontos da Rodada',
    totalScore: 'Pontuação Total',
    continueGame: 'Continuar',
    nextRound: (n: number) => `Próxima: Rodada ${n}`,

    // Game Rules
    rules: 'Regras',
    rulesTitle: 'Como Jogar Azul',
    rulesClose: 'Fechar',
    rulesObjective: 'Objetivo',
    rulesObjectiveText: 'Decore as paredes do Palácio Real de Évora com azulejos portugueses. Ganhe pontos colocando peças na parede e complete linhas, colunas e conjuntos de cores para bônus.',
    rulesGameplay: 'Jogabilidade',
    rulesGameplayStep1: '1. Selecione peças de uma fábrica ou do centro',
    rulesGameplayStep1Detail: 'Pegue todas as peças de UMA cor. As outras vão para o centro.',
    rulesGameplayStep2: '2. Coloque nas linhas de padrão',
    rulesGameplayStep2Detail: 'Cada linha só aceita uma cor. Linhas completas movem uma peça para a parede.',
    rulesGameplayStep3: '3. Peças extras vão para o chão',
    rulesGameplayStep3Detail: 'Peças que não cabem nas linhas causam penalidades.',
    rulesScoring: 'Pontuação',
    rulesScoringTile: 'Cada peça na parede: 1 ponto + peças adjacentes',
    rulesScoringRow: 'Linha horizontal completa: +2 pontos',
    rulesScoringColumn: 'Coluna vertical completa: +7 pontos',
    rulesScoringColor: 'Todas 5 peças de uma cor: +10 pontos',
    rulesFloorPenalties: 'Penalidades do Chão',
    rulesFloorPenaltiesText: '-1, -1, -2, -2, -2, -3, -3 pontos por posição',
    rulesEndGame: 'Fim do Jogo',
    rulesEndGameText: 'O jogo termina quando um jogador completa uma linha horizontal na parede. O jogador com mais pontos vence!',
    rulesFirstPlayer: 'Marcador de Primeiro Jogador',
    rulesFirstPlayerText: 'Quem pegar peças do centro primeiro leva o marcador (-1 ponto) mas joga primeiro na próxima rodada.',
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
    playingAs: 'Playing as:',

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

    // Change Room Code
    changeCode: 'Change Code',
    changeCodeTitle: 'Change Room Code',
    newRoomCode: 'New Code',
    enterNewRoomCode: 'Enter new code (6 characters)',
    changeCodeDescription: 'Enter a new 6-character code (letters and numbers)',
    codeChanged: 'Code changed!',
    invalidCode: 'Invalid code. Use 6 alphanumeric characters.',

    // Penalty Notifications
    penaltyOverflow: (name: string, count: number) =>
      `${name} placed ${count} tile(s) on floor (line full)`,
    penaltyFloorChoice: (name: string, count: number) =>
      `${name} placed ${count} tile(s) on floor`,
    penaltyFirstPlayer: (name: string) =>
      `${name} took the first player marker (-1)`,
    penalty: 'Penalty',

    // Round Summary
    roundSummary: 'Round Summary',
    roundComplete: (n: number) => `Round ${n} Complete!`,
    tilesPlaced: 'Tiles on Wall',
    wallBonus: 'Adjacency Bonus',
    floorPenalty: 'Floor Penalty',
    roundPoints: 'Round Points',
    totalScore: 'Total Score',
    continueGame: 'Continue',
    nextRound: (n: number) => `Next: Round ${n}`,

    // Game Rules
    rules: 'Rules',
    rulesTitle: 'How to Play Azul',
    rulesClose: 'Close',
    rulesObjective: 'Objective',
    rulesObjectiveText: 'Decorate the walls of the Royal Palace of Évora with Portuguese tiles. Score points by placing tiles on the wall and complete rows, columns, and color sets for bonuses.',
    rulesGameplay: 'Gameplay',
    rulesGameplayStep1: '1. Select tiles from a factory or center',
    rulesGameplayStep1Detail: 'Take all tiles of ONE color. Others go to the center.',
    rulesGameplayStep2: '2. Place on pattern lines',
    rulesGameplayStep2Detail: 'Each line accepts only one color. Complete lines move one tile to the wall.',
    rulesGameplayStep3: '3. Extra tiles go to the floor',
    rulesGameplayStep3Detail: 'Tiles that don\'t fit on lines cause penalties.',
    rulesScoring: 'Scoring',
    rulesScoringTile: 'Each tile on wall: 1 point + adjacent tiles',
    rulesScoringRow: 'Complete horizontal row: +2 points',
    rulesScoringColumn: 'Complete vertical column: +7 points',
    rulesScoringColor: 'All 5 tiles of one color: +10 points',
    rulesFloorPenalties: 'Floor Penalties',
    rulesFloorPenaltiesText: '-1, -1, -2, -2, -2, -3, -3 points per position',
    rulesEndGame: 'End Game',
    rulesEndGameText: 'The game ends when a player completes a horizontal row on the wall. The player with the most points wins!',
    rulesFirstPlayer: 'First Player Marker',
    rulesFirstPlayerText: 'Whoever takes tiles from the center first gets the marker (-1 point) but plays first next round.',
  },
} as const;

export type TranslationKey = keyof typeof translations['en-US'];
