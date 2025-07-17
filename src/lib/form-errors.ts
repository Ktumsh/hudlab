export const formErrors = {
  required: {
    default: "Este campo es obligatorio",
    email: "Debes ingresar un correo válido",
    username: "El nombre de usuario es obligatorio",
    displayName: "El nombre para mostrar es obligatorio",
    bio: "La biografía es obligatoria",
    password: "La contraseña es obligatoria",
  },
  invalid: {
    email: "El formato del correo no es válido",
    username:
      "El nombre de usuario solo puede contener letras, números y guiones bajos",
    displayName: "El nombre para mostrar solo puede contener letras y espacios",
    bio: "La biografía solo puede contener letras, números y espacios",
  },
  length: {
    usernameMin: "El nombre de usuario debe tener al menos 3 caracteres",
    usernameMax: "El nombre de usuario no puede exceder los 20 caracteres",
    displayNameMin: "El nombre es obligatorio",
    displayNameMax: "El nombre para mostrar no puede exceder los 50 caracteres",
    bioMax: "La biografía no puede exceder los 160 caracteres",
    passwordMin: "La contraseña debe tener al menos 8 caracteres",
  },
  password: {
    noUppercase: "Debe contener al menos una letra mayúscula",
    noLowercase: "Debe contener al menos una letra minúscula",
    noNumber: "Debe contener al menos un número",
    noSymbol: "Debe contener al menos un carácter especial",
    mismatch: "Las contraseñas no coinciden",
  },
  confirmPassword: {
    mismatch: "Las contraseñas no coinciden",
  },
};
