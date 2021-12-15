const canvas = document.querySelector('#canvas'),
    context = canvas.getContext('2d'),
    canvasFriend = document.querySelector('#canvasFriend'),
    contextFriend = canvasFriend.getContext('2d'),
    start = document.querySelector('.start'),
    continued = document.querySelector('.continue'),
    username = document.querySelector('.input-username'),
    auth = document.querySelector('.auth'),
    app = document.querySelector('.app'),
    infoAuth = document.querySelector('.infoAuth'),
    friendName = document.querySelector('.friend-name'),
    yourName = document.querySelector('.you-name'),
    isWinner = document.querySelector('.isWinner');

const socket = io();

const font = '32px Comic Sans MS'

const bird = new Image(),
    bg = new Image(),
    fg = new Image(),
    pipeUp = new Image(),
    pipeBottom = new Image(),
    nightBg = new Image()

bird.src = 'image/bird.png'
bg.src = 'image/bg.png'
fg.src = 'image/fg.png'
pipeUp.src = 'image/pipeUp.png'
pipeBottom.src = 'image/pipeBottom.png'
nightBg.src = 'image/nightBg.png'

const state = {
    users: 0,
    userName: null,
    friendName: null,
    xPos: 10,
    yPos: 150,
    grav: 1.6,
    gap: 120,
    pipe: [],
    isGameOver: false,
}

window.state = state

state.pipe[0] = {
    x: canvas.width,
    y: 0
}

const init = () => {
    continued.addEventListener('click', () => {
        if (username.value) {
            state.userName = username.value
            socket.emit('users', 1)
        } else {
            infoAuth.innerHTML = 'Entry your name, please!'
        }
    })
    canvas.addEventListener('click', () => {
        moveUp()
    })
}

const moveUp = () => {
    if (state.yPos > 0) {
        state.yPos -= 30
    }
}

const draw = () => {
    if (!state.isGameOver) {
        context.drawImage(bg, 0, 0)
        for (let i = 0; i < state.pipe.length; i++) {
            context.drawImage(pipeUp, state.pipe[i].x, state.pipe[i].y)
            context.drawImage(pipeBottom, state.pipe[i].x, state.pipe[i].y + pipeUp.height + state.gap)
            state.pipe[i].x--
            if (state.pipe[i].x === 100) {
                state.pipe.push({
                    x: canvas.width,
                    y: Math.floor(Math.random() * pipeUp.height) - pipeUp.height
                })
            }
            if (state.xPos + bird.width >= state.pipe[i].x
                && state.xPos <= state.pipe[i].x + pipeUp.width
                && (state.yPos <= state.pipe[i].y + pipeUp.height || state.yPos + bird.height >= state.pipe[i].y + pipeUp.height + state.gap) || state.yPos + bird.height >= canvas.height - fg.height) {
                context.clearRect(0, 0, canvas.width, canvas.height)
                context.fillStyle = '#000'
                context.font = font
                context.drawImage(bg, 0, 0)
                context.fillText(`GameOver`, canvas.width / 2 - 70, canvas.height / 2)
                state.isGameOver = true
                socket.emit('gameOver', true)
                return
            }
        }
        context.drawImage(fg, 0, canvas.height - fg.height)
        context.drawImage(bird, state.xPos, state.yPos)
        state.yPos += state.grav
        context.fillStyle = '#000'
        context.font = font
        context.fillText(state.userName, 10, canvas.height - 20)
        requestAnimationFrame(draw)
        socket.emit('start', state)
    } else {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = '#000'
        context.font = font
        context.drawImage(bg, 0, 0)
        context.fillText(`GameOver`, canvas.width / 2 - 70, canvas.height / 2)
    }
}

const drawFriendBoard = (xPos, yPos, grav, gap, score, pipe) => {
    if (!state.isGameOver) {
        contextFriend.drawImage(nightBg, 0, 0)
        contextFriend.drawImage(fg, 0, canvasFriend.height - fg.height)
        contextFriend.drawImage(bird, xPos, yPos)
        for (let i = 0; i < pipe.length; i++) {
            contextFriend.drawImage(pipeUp, pipe[i].x, pipe[i].y)
            contextFriend.drawImage(pipeBottom, pipe[i].x, pipe[i].y + pipeUp.height + gap)
        }
        contextFriend.font = font
        contextFriend.fillStyle = '#000'
        contextFriend.fillText(state.friendName, 10, canvas.height - 20)
    }
}



init()

socket.on('start', ({userName, xPos, yPos, grav, gap, score, pipe}) => {
    if (state.userName !== userName) {
        state.friendName = userName
        friendName.innerHTML = userName
        yourName.innerHTML = state.userName
        drawFriendBoard(xPos, yPos, grav, gap, score, pipe)
    }
});

socket.on('users', inc => {
    state.users = state.users + inc
    if (state.users === 2) {
        auth.classList.add('true')
        app.classList.add('visible')
        draw()
    } else if (state.userName) {
        infoAuth.innerHTML = 'Please wait your friend...'
    }
});

socket.on('gameOver', bool => {
    state.isGameOver ? isWinner.innerHTML = 'You lose' : isWinner.innerHTML = 'You win'
    state.isGameOver = bool
    contextFriend.clearRect(0, 0, canvas.width, canvas.height)
    contextFriend.fillStyle = '#FFF'
    contextFriend.font = font
    contextFriend.drawImage(nightBg, 0, 0)
    contextFriend.fillText(`GameOver`, canvas.width / 2 - 70, canvas.height / 2)
});