const isAdminPortal = process.cwd().includes("admin-portal");

const config = {
  plugins: isAdminPortal
    ? {
        "@tailwindcss/postcss": {},
      }
    : {
        tailwindcss: {},
        autoprefixer: {},
      },
};

export default config;
