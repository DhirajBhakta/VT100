import { bold, green, red } from "colorette";
import { getAuthToken } from "../config.js";

export const checkAuthToken = (email: string) => {
    const token = getAuthToken(email);
    if (!token) {
        console.log(red(bold("Unauthenticated") + "\nPlease login using `rh login` command"));
        process.exit();
    }
    return token;
};

export const loginUser = (email: string) => {
    const token = getAuthToken(email);
    if (!token) {
        // TODO: Login flow
    } else {
        console.log(green("Login successful for: " + bold(email)));
    }
};
