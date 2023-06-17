class LevellingManager {
    constructor(bot) {
        this.b = bot;
    }

    // Calculate the total level of the user using its xp
    getLevelWithXP(currentXP) {
        let level = 0;
        let xpForNextLevel = 0;
      
        while (currentXP >= xpForNextLevel) {
          level++;
          xpForNextLevel += level * level;
        }
      
        return level;
    }

    // Returns total xp required for a level
    calculateXpForLevel(targetLevel) {
        let totalXp = 0;
        for (let i = 1; i < targetLevel; i++) {
            totalXp += i * i;
        }
        return totalXp;
    }

    // Returns the required XP for the next level, eg: you might need 10000 xp to get from level 100 to level 101
    getNextLevelXPWithLevel(level) {
        // Calculate the XP requirement for the next level
        const nextLevelXP = (level + 1) * (level + 1);

        return nextLevelXP;
    }

    // Returns the required XP for the next level, eg: you might need 10000 xp to get from level 100 to level 101
    getNextLevelXP(currentXP) {
        // Get the current level
        const currentLevel = this.getLevelWithXP(currentXP);

        // Calculate the XP requirement for the next level
        const nextLevelXP = (currentLevel + 1) * (currentLevel + 1);

        return nextLevelXP;
    }

    // could be old lvl
    isLevelledUp(xp, currentLevel) {
        if (xp >= this.calculateXpForLevel(currentLevel + 1)) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = LevellingManager;