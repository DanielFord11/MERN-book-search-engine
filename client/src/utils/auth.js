// Use this to decode a token and get the user's information out of it
import decode from 'jwt-decode';

// Create a new class to instantiate for a user
class AuthService {
  // Get user data
  getProfile() {
    return decode(this.getToken());
  }

  // Check if the user is logged in
  loggedIn() {
    // Check if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token); // Handwaiving here
  }

  // Check if the token is expired
  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return false;
    }
  }

  getToken() {
    // Retrieve the user token from localStorage
    return localStorage.getItem('id_token');
  }

  login(idToken) {
    // Save the user token to localStorage
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  logout() {
    // Clear the user token and profile data from localStorage
    localStorage.removeItem('id_token');
    // This will reload the page and reset the state of the application
    window.location.assign('/');
  }
}

export default new AuthService();
