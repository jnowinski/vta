export function getDashboardRoute(userRole: string) {
    switch (userRole) {
        case 'admin':
            return '/admin-dashboard';
        case 'student':
            return '/student-dashboard';
        default:
            console.log('Unknown role, redirecting to student dashboard');
            return '/student-dashboard';
    }
}
// This function can be used to determine the redirect path after login or signup