import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

export const hashToken = async (token: string) => {
    return bcrypt.hash(token, 10);
}

export const compareToken = async (token: string, hash: string) => {
    return bcrypt.compare(token, hash);
}