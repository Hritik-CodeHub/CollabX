const generateMeetingCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const randomCharacter = () => {
        if (globalThis.crypto?.getRandomValues) {
            return characters[crypto.getRandomValues(new Uint32Array(1))[0] % characters.length];
        }

        return characters[Math.floor(Math.random() * characters.length)];
    };

    return [3, 4, 3].map((length) => Array.from({ length }, randomCharacter).join('')).join('-');
};

export {
    generateMeetingCode
}