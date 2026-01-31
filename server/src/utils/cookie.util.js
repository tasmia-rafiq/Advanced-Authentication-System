export const tokenCookieOptions = (time) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none", // it avoids csrf attacks
    maxAge: time,
  };
  
  return options;
};
