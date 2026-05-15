export const getRoleHomePath = (role) => {
  switch (role) {
    case 'OWNER':
      return '/owner';
    case 'ADMIN':
      return '/admin';
    case 'AGENT':
      return '/agent';
    case 'CUSTOMER':
    default:
      return '/home';
  }
};
