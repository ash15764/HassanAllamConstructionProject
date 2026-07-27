export const usernamePattern = /^[a-zA-Z0-9_]+$/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(username: string): string | null {
    if (!username?.trim()) return "Username is required.";
    if (!usernamePattern.test(username)) return "Username can only contain letters, numbers, and '_'.";
    return null;
}

export function validateEmail(email: string): string | null {
    if (!email?.trim()) return "Email is required.";
    if (!emailPattern.test(email)) return "Please enter a valid email address.";
    return null;
}

export function validateDob(dob: string | null): string | null {
    if (dob === null || dob === undefined || dob === '') return "Date of birth is required.";
    const today = new Date();
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "Please enter a valid date.";
    let age = today.getFullYear() - birthDate.getFullYear();
    if (age < 16 || age > 120) return "Age must be between 16 and 120.";
    return null;
}

export function validatePassword(password: string): string | null {
    if (!password?.trim()) return "Password is required.";
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    if (!hasMinLength || !hasLetter || !hasDigit || !hasSymbol) {
        return "Password must be at least 8 characters and include letters, digits, and symbols.";
    }
    return null;
}

export function validateConfirmPassword(password: string, reEnterPassword: string): string | null {
    if (!reEnterPassword?.trim()) return "Please confirm your password.";
    if (password !== reEnterPassword) return "Passwords do not match.";
    return null;
}