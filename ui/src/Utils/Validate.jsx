export const validateFirstName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces e at the end are not allowed.";
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed.";
    }

    // Ensure only alphabetic characters and spaces
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
    }

    // Check for minimum and maximum word length
    else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 1) {
          return "Minimum Length 1 Character Required."; // If any word is shorter than 1 character
        } else if (word.length > 100) {
          return "Max Length 100 Characters Required."; // If any word is longer than 100 characters
        }
      }
      // Check if there are multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }

      // Check minimum character length after other validations
      if (trimmedValue.length < 3) {
        return "Minimum 3 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  //Validate LastName
   export const validateLastName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed.";
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed.";
    }

    // Ensure only alphabetic characters and spaces
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
    }

    // Check for minimum and maximum word length
    else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 1) {
          return "Minimum Length 1 Character Required."; // If any word is shorter than 1 character
        } else if (word.length > 100) {
          return "Max Length 100 Characters Required."; // If any word is longer than 100 characters
        }
      }

      // Check if there are multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }

      // Check minimum character length after other validations
      if (trimmedValue.length < 1) {
        return "Minimum 1 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

// validate password
  export  const validatePassword = (value) => {
    const errors = [];
    if (!/(?=.*[0-9])/.test(value)) {
      errors.push("at least one digit");
    }
    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("at least one uppercase letter");
    }
    if (!/(?=.*\W)/.test(value)) {
      errors.push("at least one special character");
    }
    if (value.includes(" ")) {
      errors.push("no spaces");
    }

    if (errors.length > 0) {
      return `Password must contain ${errors.join(", ")}.`;
    }
    return true; // Return true if all conditions are satisfied
  };

 export const validateNumber = (value) => {
    // Check if the input is empty
    if (!value || value.trim().length === 0) {
      return true;
    }

    // Check if the value contains only digits
    if (!/^\d+$/.test(value)) {
      return "Only Numeric Characters Are Allowed.";
    }

    // Check if there are any leading or trailing spaces
    if (/^\s|\s$/.test(value)) {
      return "No Leading or Trailing Spaces Are Allowed.";
    }

    // Check for multiple spaces in between numbers
    if (/\s{2,}/.test(value)) {
      return "No Multiple Spaces Between Numbers Allowed.";
    }

    // Optionally: Check if the number is composed of repeating digits
    const isRepeating = /^(\d)\1{11}$/.test(value); // Check if all digits are the same (e.g., "111111111111")
    if (isRepeating) {
      return "The Number Cannot Consist Of The Same Digit Repeated.";
    }

    return true; // Return true if all validations pass
  };

 export  const validateLocation = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Location is Required.";
    }

    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed."; // Trailing space error
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed."; // Leading space error
    }

    // Ensure only allowed characters (alphabets, numbers, spaces, and some special chars)
    else if (!/^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/.test(trimmedValue)) {
      return "Invalid Format of Location.";
    }

    // Check for minimum and maximum word length
    else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 1) {
          return "Minimum Length 1 Character Required."; // If any word is shorter than 1 character
        } else if (word.length > 100) {
          return "Max Length 100 Characters Required."; // If any word is longer than 100 characters
        }
      }

      // Check if there are multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }
       if (trimmedValue.length < 3) {
        return "Minimum 3 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  //Validate Phone Number
  export const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber.startsWith("+91 ")) {
        return "Phone number must start with '+91 ' (including a single space).";
    }

    const phoneRegex = /^\+91 [6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return "Phone number must start with +91, followed by a space, and begin with a digit between 6-9, with exactly 10 digits after the space.";
    }

    const repeatedDigitRegex = /(\d)\1{9,}/;
    const numberPart = phoneNumber.split(" ")[1];

    if (repeatedDigitRegex.test(numberPart)) {
        return "Phone number cannot contain the same digit more than 9 times.";
    }

    return true; // Validation passed
};



