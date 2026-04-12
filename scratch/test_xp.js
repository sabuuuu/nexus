
function xpForLevel(level) {
  return Math.floor(50 * Math.pow(level, 1.8))
}

function xpProgressInLevel(totalXp, level) {
  let totalXpToCurrentLevel = BigInt(0)
  for (let i = 1; i < level; i++) {
    totalXpToCurrentLevel += BigInt(xpForLevel(i + 1))
  }
  
  const progressInCurrentLevel = BigInt(totalXp) - totalXpToCurrentLevel
  const xpNeededForNextLevel = BigInt(xpForLevel(level + 1))
  
  return Number(progressInCurrentLevel) / Number(xpNeededForNextLevel)
}

console.log("Level 1, 0 XP:", xpProgressInLevel(0, 1))
console.log("Level 1, 50 XP:", xpProgressInLevel(50, 1))
console.log("Level 1, 100 XP:", xpProgressInLevel(100, 1))
console.log("Level 2, 180 XP:", xpProgressInLevel(180, 2))
console.log("XP for Level 2:", xpForLevel(2))
