// onInput field for the 
export const toInputTitleCase = (e) => {
  const input = e.target;
  let value = input.value;
  const cursorPosition = input.selectionStart; // Save the cursor position

  // Remove leading spaces
  value = value.replace(/^\s+/g, "");

  // Ensure only allowed characters (alphabets and spaces)
  const allowedCharsRegex = /^[a-zA-Z\s]+$/;
  value = value
    .split("")
    .filter((char) => allowedCharsRegex.test(char))
    .join("");

  // Capitalize the first letter of each word
  const words = value.split(" ");

  // Capitalize the first letter of each word and leave the rest of the characters as they are
  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      // Capitalize the first letter, keep the rest as is
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return "";
  });

  // Join the words back into a string
  let formattedValue = capitalizedWords.join(" ");

  // Remove spaces not allowed (before the first two characters)
  if (formattedValue.length > 1) {
    formattedValue =
      formattedValue.slice(0, 1) +
      formattedValue.slice(1).replace(/\s+/g, " ");
  }

  // Update input value
  input.value = formattedValue;

  // Restore the cursor position
  input.setSelectionRange(cursorPosition, cursorPosition);
};

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

     // Ensure the first letter and every letter after a space is uppercase
     if (!/^[A-Z][A-Za-z]*([ ][A-Z][A-Za-z]*)*$/.test(trimmedValue)) {
      return "Each Word Should Start With an Uppercase Letter.";
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
     // Ensure the first letter and every letter after a space is uppercase
     if (!/^[A-Z][a-z]*([ ][A-Z][a-z]*)*$/.test(trimmedValue)) {
      return "Each Word Should Start With an Uppercase Letter.";
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

     // Ensure the first letter and every letter after a space is uppercase
     if (!/^[A-Z][a-z]*([ ][A-Z][a-z]*)*$/.test(trimmedValue)) {
      return "Each Word Should Start With an Uppercase Letter.";
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

//validate MailId
export const validateEmail = (email) => {
    if (email !== email.trim()) {
        return "Email should not have leading or trailing spaces.";
    }
    if (/\s/.test(email)) {
        return "Email should not contain any spaces.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}$/;
    
    const match = email.match(emailRegex);
    if (!match) {
        return "Invalid email format. Please enter a valid email address.";
    }

    return true;
};

// validate Aadhar number
export const validateAadhar = (aadhar) => {
    if (aadhar !== aadhar.trim()) {
        return "Aadhar number should not have leading or trailing spaces.";
    }
    if (/\s/.test(aadhar)) {
        return "Aadhar number should not contain any spaces.";
    }

    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadhar)) {
        return "Invalid Aadhar number. It must be exactly 12 digits.";
    }

    return true;
};

//validate PAN Number
export const validatePAN = (pan) => {
    if (pan !== pan.trim()) {
        return "PAN should not have leading or trailing spaces.";
    }
    if (/\s/.test(pan)) {
        return "PAN should not contain any spaces.";
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(pan)) {
        return "Invalid PAN number. Format should be 5 uppercase letters, 4 digits, and 1 uppercase letter (e.g., ABCDE1234F).";
    }

    return true;
};

// validate UAN Number
export const validateUAN = (uan) => {
    if (uan !== uan.trim()) {
        return "UAN should not have leading or trailing spaces.";
    }
    if (/\s/.test(uan)) {
        return "UAN should not contain any spaces.";
    }

    const uanRegex = /^\d{12}$/;
    if (!uanRegex.test(uan)) {
        return "Invalid UAN number. It must be exactly 12 digits.";
    }

    return true;
};

//Bank Account Number
export const validateBankAccount = (accountNumber) => {
    if (accountNumber !== accountNumber.trim()) {
        return "Bank account number should not have leading or trailing spaces.";
    }
    if (/\s/.test(accountNumber)) {
        return "Account number should not contain any spaces.";
    }

    const accountRegex = /^\d{6,18}$/;
    if (!accountRegex.test(accountNumber)) {
        return "Invalid Bank Account Number. It must be between 6 to 18 digits.";
    }

    return true;
};

//Bank IFSC Code
export const validateIFSC = (ifsc) => {
    if (ifsc !== ifsc.trim()) {
        return "IFSC code should not have leading or trailing spaces.";
    }
    if (/\s/.test(ifsc)) {
        return "IFSC Code should not contain any spaces.";
    }


    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) {
        return "Invalid IFSC Code. Format should be 4 uppercase letters, '0', and 6 alphanumeric characters (e.g., SBIN0001234).";
    }

    return true;
};

//validate Bank Branch

export const validateBankBranch =(bankBranch)=>{
    if(bankBranch !== bankBranch.trim()){
        return "No Leading and Trailing Spaces"
    }
    const bankBranchRegex=/^[a-zA-Z0-9,.-_]{2,50}$/;
    if(!bankBranchRegex.test(bankBranch)){
        return "Invalid Branch Format"
    }
    return true;
}



