const createTokenUser = (user) => {
  const newUser = {
    userId: user._id,
    role: user.role,
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || "",
    age: user?.age || '',
    gender: user?.gender || '',
    department: user?.department || '',
    year: user?.year || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
  }

  return {...newUser}
  // return {name: user.name, userId: user._id, role: user.role, email: user.email }
};

module.exports = createTokenUser;
