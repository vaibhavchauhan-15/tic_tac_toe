import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import './App.css'

function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [gameHistory, setGameHistory] = useState<{x: number, o: number}>({ x: 0, o: 0 })
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showVictoryLine, setShowVictoryLine] = useState(false)
  const [playingWithComputer, setPlayingWithComputer] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showNameForm, setShowNameForm] = useState(false)
  const [player1Name, setPlayer1Name] = useState('')
  const [player2Name, setPlayer2Name] = useState('')
  const boardRef = useRef<HTMLDivElement>(null)

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  const calculateWinner = (squares: Array<string | null>): [string | null, number[] | null] => {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [squares[a], lines[i]]
      }
    }
    return [null, null]
  }

  // Computer move logic
  const getComputerMove = (currentBoard: Array<string | null>): number => {
    // Find empty squares
    const emptySquares = currentBoard
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null) as number[]

    if (emptySquares.length === 0) return -1
    
    // Check if computer can win in one move
    for (const index of emptySquares) {
      const boardCopy = [...currentBoard]
      boardCopy[index] = 'O' // Computer is always O
      const [winner] = calculateWinner(boardCopy)
      if (winner === 'O') return index
    }
    
    // Check if player can win in one move and block
    for (const index of emptySquares) {
      const boardCopy = [...currentBoard]
      boardCopy[index] = 'X' // Player is always X
      const [winner] = calculateWinner(boardCopy)
      if (winner === 'X') return index
    }
    
    // Take center if available
    if (emptySquares.includes(4)) return 4
    
    // Take corners if available
    const corners = [0, 2, 6, 8].filter(corner => emptySquares.includes(corner))
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)]
    }
    
    // Take any available square
    return emptySquares[Math.floor(Math.random() * emptySquares.length)]
  }

  const makeComputerMove = () => {
    if (gameOver || !playingWithComputer || isXNext) return
    
    const computerMoveIndex = getComputerMove(board)
    if (computerMoveIndex === -1) return
    
    setTimeout(() => {
      const newBoard = [...board]
      newBoard[computerMoveIndex] = 'O'
      setBoard(newBoard)
      
      const [winningPlayer, line] = calculateWinner(newBoard)
      if (winningPlayer) {
        setWinner(winningPlayer)
        setWinningLine(line)
        setGameOver(true)
        
        setTimeout(() => {
          setShowVictoryLine(true)
        }, 300)
        
        if (winningPlayer === 'O') {
          setGameHistory(prev => ({ ...prev, o: prev.o + 1 }))
        }
      } else if (!newBoard.includes(null)) {
        setGameOver(true)
      } else {
        setIsXNext(true)
      }
    }, 500) // Add a delay to make it feel like the computer is "thinking"
  }

  // Effect to trigger computer's move
  useEffect(() => {
    if (playingWithComputer && !isXNext && !gameOver && gameStarted) {
      makeComputerMove()
    }
  }, [isXNext, gameOver, playingWithComputer, gameStarted])

  const handleClick = (index: number) => {
    // If game is not started or square is already filled or game is over, do nothing
    if (!gameStarted || board[index] || gameOver) return
    
    // If playing with computer and it's not player's turn, do nothing
    if (playingWithComputer && !isXNext) return

    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    
    const [winningPlayer, line] = calculateWinner(newBoard)
    if (winningPlayer) {
      setWinner(winningPlayer)
      setWinningLine(line)
      setGameOver(true)
      
      setTimeout(() => {
        setShowVictoryLine(true)
      }, 300)
      
      if (winningPlayer === 'X') {
        setGameHistory(prev => ({ ...prev, x: prev.x + 1 }))
      } else {
        setGameHistory(prev => ({ ...prev, o: prev.o + 1 }))
      }
    } else if (!newBoard.includes(null)) {
      setGameOver(true)
    } else {
      setIsXNext(!isXNext)
    }
  }

  const startGame = (withComputer: boolean) => {
    if (!withComputer && !showNameForm) {
      setShowNameForm(true)
      return
    }
    
    resetGame()
    setPlayingWithComputer(withComputer)
    setGameStarted(true)
    setShowNameForm(false)
  }

  const handleStartWithNames = (e: React.FormEvent) => {
    e.preventDefault()
    // If names are empty, keep default placeholder values for display
    startGame(false)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setGameOver(false)
    setWinner(null)
    setWinningLine(null)
    setShowVictoryLine(false)
    if (!gameStarted) {
      setGameStarted(false)
    }
  }

  const backToMenu = () => {
    resetGame()
    setGameStarted(false)
    setShowNameForm(false)
  }

  const getVictoryLineStyle = () => {
    if (!winningLine || !boardRef.current) return {}
    
    // Adjust for mobile screens
    const isMobile = window.innerWidth <= 480;
    const squareSize = isMobile ? 70 : 80; // Match with CSS
    const margin = 4; // Match with CSS
    
    // Get positions based on which line won
    if (winningLine[0] === 0 && winningLine[2] === 2) {
      // Top row
      return {
        width: '90%',
        height: '8px',
        top: squareSize / 2,
        left: '5%',
        transform: 'translateY(-50%)'
      }
    } else if (winningLine[0] === 3 && winningLine[2] === 5) {
      // Middle row
      return {
        width: '90%',
        height: '8px',
        top: squareSize * 1.5 + margin * 2,
        left: '5%',
        transform: 'translateY(-50%)'
      }
    } else if (winningLine[0] === 6 && winningLine[2] === 8) {
      // Bottom row
      return {
        width: '90%',
        height: '8px',
        top: squareSize * 2.5 + margin * 4,
        left: '5%',
        transform: 'translateY(-50%)'
      }
    } else if (winningLine[0] === 0 && winningLine[2] === 6) {
      // Left column
      return {
        width: '8px',
        height: '90%',
        left: squareSize / 2,
        top: '5%',
        transform: 'translateX(-50%)'
      }
    } else if (winningLine[0] === 1 && winningLine[2] === 7) {
      // Middle column
      return {
        width: '8px',
        height: '90%',
        left: squareSize * 1.5 + margin * 2,
        top: '5%',
        transform: 'translateX(-50%)'
      }
    } else if (winningLine[0] === 2 && winningLine[2] === 8) {
      // Right column
      return {
        width: '8px',
        height: '90%',
        left: squareSize * 2.5 + margin * 4,
        top: '5%',
        transform: 'translateX(-50%)'
      }
    } else if (winningLine[0] === 0 && winningLine[2] === 8) {
      // Diagonal from top-left to bottom-right
      return {
        width: '8px',
        height: '120%',
        left: '50%',
        top: '-10%',
        transform: 'rotate(45deg)',
        transformOrigin: 'center'
      }
    } else if (winningLine[0] === 2 && winningLine[2] === 6) {
      // Diagonal from top-right to bottom-left
      return {
        width: '8px',
        height: '120%',
        left: '50%',
        top: '-10%',
        transform: 'rotate(-45deg)',
        transformOrigin: 'center'
      }
    }
    
    return {}
  }

  const renderSquare = (index: number) => {
    const isWinningSquare = winningLine?.includes(index)
    
    return (
      <motion.button
        className={`square ${board[index] === 'X' ? 'x-mark' : 'o-mark'} ${isWinningSquare ? 'winning-square' : ''}`}
        onClick={() => handleClick(index)}
        whileHover={!board[index] && !gameOver && gameStarted ? { scale: 1.1 } : {}}
        whileTap={!board[index] && !gameOver && gameStarted ? { scale: 0.9 } : {}}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 1, 
          scale: isWinningSquare && gameOver ? [1, 1.2, 1] : 1,
          backgroundColor: isWinningSquare ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
          y: isWinningSquare && gameOver ? [0, -10, 0] : 0,
        }}
        transition={{ 
          duration: 0.3,
          y: { repeat: isWinningSquare && gameOver ? Infinity : 0, repeatDelay: 0.5 }
        }}
      >
        {board[index] && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              rotate: isWinningSquare ? [0, 10, -10, 0] : 0
            }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              rotate: { repeat: isWinningSquare ? Infinity : 0, repeatDelay: 0.5 }
            }}
          >
            {board[index]}
          </motion.span>
        )}
      </motion.button>
    )
  }

  // Confetti effect on win
  useEffect(() => {
    if (winner) {
      // Add confetti animation if needed
    }
  }, [winner])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDarkMode)
  }, [isDarkMode])

  // Add a custom hook for detecting screen size
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render when screen size changes
      setShowVictoryLine(false);
      if (winner && winningLine) {
        setTimeout(() => {
          setShowVictoryLine(true);
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [winner, winningLine]);

  const status = winner 
    ? `Winner: ${winner === 'X' ? (player1Name || 'Player X') : (player2Name || 'Player O')}` 
    : gameOver 
    ? "Game ended in a draw!" 
    : `Next player: ${isXNext ? (player1Name || 'Player X') : (player2Name || 'Player O')}`

  return (
    <div className={`game-container ${!isDarkMode ? 'light-mode' : ''}`}>
      {winner && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
      
      <motion.div
        className="theme-toggle"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </motion.div>
      
      <motion.h1 
        className="game-title"
        initial={{ y: -50, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          scale: winner ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          duration: 0.5,
          scale: { repeat: winner ? Infinity : 0, repeatDelay: 2 }
        }}
      >
        Tic Tac Toe
      </motion.h1>
      
      {gameStarted ? (
        <>
          <div className="score-board">
            <motion.div 
              className="score x-score"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {playingWithComputer ? 'You' : (player1Name || 'Player X')}: {gameHistory.x}
            </motion.div>
            <motion.div 
              className="score o-score"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {playingWithComputer ? 'CPU' : (player2Name || 'Player O')}: {gameHistory.o}
            </motion.div>
          </div>
          
          <AnimatePresence>
            {winner && (
              <motion.div
                className="winner-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {playingWithComputer 
                  ? (winner === 'X' ? '🎉 You Win! 🎉' : '😯 CPU Wins! 😯') 
                  : (winner === 'X' ? `🎉 ${player1Name || 'Player X'} Wins! 🎉` : `🎊 ${player2Name || 'Player O'} Wins! 🎊`)}
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div 
            className="game-status"
            animate={{ 
              scale: gameOver ? [1, 1.2, 1] : 1,
              color: winner ? (winner === 'X' ? '#ec4899' : '#60a5fa') : '#ffffff'
            }}
            transition={{ duration: 0.5 }}
          >
            {playingWithComputer 
              ? (isXNext ? 'Your turn' : 'Computer is thinking...') 
              : status}
          </motion.div>
          
          <motion.div 
            className="board"
            ref={boardRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {showVictoryLine && winner && winningLine && (
              <motion.div 
                className={`victory-line ${winner === 'X' ? 'victory-x' : 'victory-o'}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={getVictoryLineStyle()}
              />
            )}
            
            <div className="board-row">
              {renderSquare(0)}
              {renderSquare(1)}
              {renderSquare(2)}
            </div>
            <div className="board-row">
              {renderSquare(3)}
              {renderSquare(4)}
              {renderSquare(5)}
            </div>
            <div className="board-row">
              {renderSquare(6)}
              {renderSquare(7)}
              {renderSquare(8)}
            </div>
          </motion.div>
          
          <div className="button-container">
            {gameOver ? (
              <>
                <motion.button
                  className="reset-button"
                  onClick={resetGame}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  Play Again
                </motion.button>
                <motion.button
                  className="menu-button"
                  onClick={backToMenu}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Main Menu
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  className="reset-button in-game-reset"
                  onClick={resetGame}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  Reset Game
                </motion.button>
                <motion.button
                  className="cancel-button"
                  onClick={backToMenu}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Cancel
                </motion.button>
              </>
            )}
          </div>
        </>
      ) : showNameForm ? (
        <motion.div 
          className="name-form-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <form onSubmit={handleStartWithNames} className="name-form">
            <div className="form-group">
              <label htmlFor="player1Name" className="player-label x-player">
                <span className="player-symbol">X</span> Player 1 Name
              </label>
              <input
                type="text"
                id="player1Name"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="name-input"
                placeholder="Player X"
                maxLength={15}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="player2Name" className="player-label o-player">
                <span className="player-symbol">O</span> Player 2 Name
              </label>
              <input
                type="text"
                id="player2Name"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="name-input"
                placeholder="Player O"
                maxLength={15}
              />
            </div>
            
            <div className="button-container">
              <motion.button
                type="submit"
                className="start-game-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>
              
              <motion.button
                type="button"
                className="back-button"
                onClick={backToMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div 
          className="menu-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            className="menu-option"
            onClick={() => startGame(false)}
            whileHover={{ scale: 1.05, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="option-icon">👥</span>
            Play with Friend
          </motion.button>
          <motion.button
            className="menu-option"
            onClick={() => startGame(true)}
            whileHover={{ scale: 1.05, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="option-icon">🤖</span>
            Play with Computer
          </motion.button>
        </motion.div>
      )}
      
      <motion.div 
        className="credits"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Developed by Vaibhav Chauhan
      </motion.div>
    </div>
  )
}

export default App
