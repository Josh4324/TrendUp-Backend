const UserService = require("../services/user-service");
const MailService = require("../services/mail-service");
const PaymentService = require("../services/payment-service");
const cloudinary = require("cloudinary").v2;
const argon2 = require("argon2");
const { Response, Token } = require("../helpers");
const { JWT_SECRET } = process.env;
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const generatePassword = require("../helpers/random");
//const front = "http://localhost:3000/#";
const front = "https://trendupp.com";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const userService = new UserService();
const mailService = new MailService();
const paymentService = new PaymentService();
const token = new Token();

exports.signUp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.findUserWithEmail(email);
    if (user) {
      const response = new Response(true, 409, "This user already exists");
      return res.status(response.code).json(response);
    }

    const code = uuidv4().slice(0, 6);

    const payload = {
      code,
    };

    const newToken = await token.generateToken(payload, 600);

    const password = await argon2.hash(req.body.password);
    req.body.password = password;
    req.body.role = "user";
    req.body.verified = false;
    req.body.token = newToken;
    const newUser = await userService.createUser(req.body);

    // verification token expires in 10 minutes(600 seconds)
    //const verificationToken = await token.generateToken(payload, 600)
    //const verificationLink = `http://${req.headers.host}/api/v1/user/verify/${newUser._id}/${verificationToken}`;
    // send verification mail
    const mail = await mailService.sendSignupEmail(
      newUser.email,
      code,
      newUser.firstName
    );

    const data = {
      id: newUser.id,
      role: "user",
    };
    const response = new Response(true, 201, "User created successfully", data);
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    return res.status(response.code).json(response);
  }
};

exports.socialSignUp = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    const userData = newUser.dataValues;
    const payload = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    };
    const newToken = await token.generateToken(payload);
    const data = {
      token: newToken,
      onboardingStep: userData.onboardingStep,
    };
    const response = new Response(true, 201, "User created successfully", data);
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    return res.status(response.code).json(response);
  }
};

exports.socialLogin = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.findUserWithEmail(email);
    const userData = user.dataValues;
    const payload = {
      id: userData.id,
      role: userData.role,
    };
    const newToken = await token.generateToken(payload);
    const data = {
      id: userData.id,
      token: newToken,
      userType: userData.userType,
      onboardingStep: userData.onboardingStep,
    };
    const response = new Response(
      true,
      200,
      "User logged in Successfully",
      data
    );
    return res.status(response.code).json(response);
  } catch (err) {}
};

exports.socialCheck = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.findUserWithEmail(email);
    if (user) {
      const response = new Response(true, 200, "This user already exists", {});
      return res.status(response.code).json(response);
    } else {
      const response = new Response(true, 200, "This user does not exists", {
        email,
      });
      return res.status(response.code).json(response);
    }
  } catch (err) {
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    return res.status(response.code).json(response);
  }
};

exports.anonymousSignUp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.findUserWithEmail(email);
    if (user) {
      const response = new Response(true, 409, "This user already exists");
      return res.status(response.code).json(response);
    }

    let generatedPassword = generatePassword(5);
    const password = await argon2.hash(generatedPassword);
    req.body.password = password;
    req.body.role = "user";
    req.body.verified = false;
    const newUser = await userService.createUser(req.body);

    const mail = await mailService.sendAnonymousSignupEmail(
      newUser.email,
      newUser.firstName,
      generatedPassword
    );

    const data = {
      id: newUser.id,
      role: "user",
    };
    const response = new Response(true, 201, "User created successfully", data);
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    return res.status(response.code).json(response);
  }
};

exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findUserWithEmail(email);

    if (!user) {
      const response = new Response(false, 401, "Incorrect email or password");
      return res.status(response.code).json(response);
    }

    const userData = user.dataValues;

    const userPassword = userData.password;
    const checkPassword = await argon2.verify(userPassword, password);

    if (!user || !checkPassword) {
      const response = new Response(false, 401, "Incorrect email or password");
      return res.status(response.code).json(response);
    }

    if (user.verified === false) {
      const code = uuidv4().slice(0, 6);

      const payload1 = {
        code,
      };

      const newToken1 = await token.generateToken(payload1, 600);
      const updatePayload = {
        token: newToken1,
      };
      const updatedUser = await userService.updateUser(user.id, updatePayload);

      const mail = await mailService.sendSignupEmail(
        email,
        code,
        userData.firstName
      );
    }

    const payload = {
      id: userData.id,
      role: userData.role,
    };

    const newToken = await token.generateToken(payload);

    const data = {
      id: userData.id,
      token: newToken,
      userType: userData.userType,
      onboardingStep: userData.onboardingStep,
      verified: userData.verified,
    };
    const response = new Response(
      true,
      200,
      "User logged in Successfully",
      data
    );
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    return res.status(response.code).json(response);
  }
};

exports.adminLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findUserWithEmail(email);

    if (!user) {
      const response = new Response(false, 401, "Incorrect email or password");
      return res.status(response.code).json(response);
    }

    if (user.role !== "admin") {
      const response = new Response(false, 401, "You are not an admin");
      return res.status(response.code).json(response);
    }

    const userData = user.dataValues;
    const userPassword = userData.password;
    const checkPassword = await argon2.verify(userPassword, password);

    if (!user || !checkPassword) {
      const response = new Response(false, 401, "Incorrect email or password");
      return res.status(response.code).json(response);
    }

    const payload = {
      id: userData.id,
      role: userData.role,
    };

    const newToken = await token.generateToken(payload);

    const data = {
      id: userData.id,
      token: newToken,
      userType: userData.userType,
      onboardingStep: userData.onboardingStep,
    };
    const response = new Response(
      true,
      200,
      "User logged in Successfully",
      data
    );
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    return res.status(response.code).json(response);
  }
};

exports.checkUserName = async (req, res) => {
  try {
    const { username } = req.body;

    console.log(req.body);

    const user = await userService.findUserWithUserName(username);

    let IsUserNameExists;

    if (user === null) {
      IsUserNameExists = false;
    } else {
      IsUserNameExists = true;
    }

    const response = new Response(true, 200, "Success", IsUserNameExists);
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    return res.status(response.code).json(response);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userService.findUserWithEmail(email);

    if (!user) {
      const response = new Response(false, 401, "User does not exist");
      return res.status(response.code).json(response);
    }

    const userData = user.dataValues;
    const newToken = await token.generateToken(userData);

    const userLink = `${front}/reset?code=${newToken}`;
    const mail = await mailService.sendPasswordResetMail(
      userData.firstName,
      email,
      userLink
    );

    const response = new Response(true, 200, "Email sent to mail");
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    // redirect user to token invalid or expired page
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, password, code } = req.body;

    const user = await userService.findUserWithEmail(email);

    const userData = user.dataValues;
    const id = userData.id;
    const userPassword = userData.password;
    const checkPassword = await argon2.verify(userPassword, password);

    if (!user || !checkPassword) {
      const response = new Response(false, 401, "Incorrect email or password");
      return res.status(response.code).json(response);
    }

    const token1 = userData.token;
    const payload = jwt.verify(token1, JWT_SECRET);

    const newPayload = {
      id,
    };

    const newToken = await token.generateToken(newPayload);

    const updatePayload = {
      verified: true,
    };

    if (payload.code !== code) {
      const response = new Response(
        false,
        400,
        "Code Expired or An error occured"
      );
      return res.status(response.code).json(response);
    }

    const data = {
      token: newToken,
      id,
    };

    const updatedUser = await userService.updateUser(id, updatePayload);
    const response = new Response(
      true,
      200,
      "User Verified Successfully",
      data
    );
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    // redirect user to token invalid or expired page
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.resendCode = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findUserWithEmail(email);

    const userData = user.dataValues;
    const id = userData.id;
    const userPassword = userData.password;
    const checkPassword = await argon2.verify(userPassword, password);

    if (!user || !checkPassword) {
      const response = new Response(false, 401, "Incorrect email or password");
      return res.status(response.code).json(response);
    }

    const code = uuidv4().slice(0, 6);

    const payload = {
      code,
    };

    const newToken = await token.generateToken(payload, 600);
    const updatePayload = {
      token: newToken,
    };
    const updatedUser = await userService.updateUser(id, updatePayload);

    const mail = await mailService.sendSignupEmail(
      email,
      code,
      userData.firstName
    );

    const response = new Response(true, 200, "Code sent Successfully");
    return res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.payload;

    const user = await userService.updateUser(id, req.body);

    const response = new Response(
      true,
      200,
      "User profile updated successfully",
      user
    );
    res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.getProfileData = async (req, res) => {
  try {
    const { id } = req.payload;

    const user = await userService.findUser(id);

    const response = new Response(true, 200, "Success", user);
    res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.getUserData = async (req, res) => {
  try {
    const { username } = req.query;

    console.log(username);

    const user = await userService.findUserWithUserName(username);

    const response = new Response(true, 200, "Success", user);
    res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.imageUpload = async (req, res) => {
  try {
    const { id } = req.payload;

    cloudinary.uploader.upload(req.file.path, async (error, result) => {
      if (result) {
        let picture = result.secure_url;
        const user = await userService.updateUser(id, { picture });

        const response = new Response(
          true,
          200,
          "Image uploaded successfully",
          picture
        );
        res.status(response.code).json(response);
      }
    });
  } catch (err) {
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const { id } = req.payload;

    const realUser = await userService.findUser(id);

    const userPassword = realUser.password;
    const checkPassword = await argon2.verify(userPassword, oldPassword);

    if (!realUser || !checkPassword) {
      const response = new Response(false, 401, "Incorrect email or password");
      return res.status(response.code).json(response);
    }

    const password = await argon2.hash(newPassword);

    const user = await userService.updateUser(id, { password });

    const response = new Response(true, 200, "Password reset successful", user);
    res.status(response.code).json(response);
  } catch (err) {
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.resetPassword2 = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const id = payload.id;

    const password = await argon2.hash(newPassword);

    const user = await userService.updateUser(id, { password });

    const response = new Response(true, 200, "Password reset successful", user);
    res.status(response.code).json(response);
  } catch (err) {
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.getCreators = async (req, res) => {
  try {
    const creators = await userService.findCreators();

    const response = new Response(true, 200, "Success", creators);
    res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.findUsers();

    const response = new Response(true, 200, "Success", users);
    res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.getSupportedCreators = async (req, res) => {
  try {
    const { email } = req.query;

    const creators = await paymentService.getApprovedPayment(email);
    let idList = [null];
    creators.map((item) => {
      idList.push(Number(item.creatorId));
    });
    idList = [...new Set(idList)];

    const users = await userService.findAllUserwithOneOrMultipleUserId(idList);

    const response = new Response(true, 200, "Success", users);
    res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};

exports.checkIsFan = async (req, res) => {
  try {
    const { fanEmail, creatorEmail } = req.body;
    let status = false;
    const creators = await paymentService.getApprovedPayment(fanEmail);
    let idList = [null];
    creators.map((item) => {
      idList.push(Number(item.creatorId));
    });
    idList = [...new Set(idList)];

    const users = await userService.findAllUserwithOneOrMultipleUserId(idList);

    users.map((item) => {
      if (item.email === creatorEmail) {
        status = true;
      }
    });

    const data = {
      status,
    };

    const response = new Response(true, 200, "Success", data);
    res.status(response.code).json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(
      false,
      500,
      "An error ocurred, please try again",
      err
    );
    res.status(response.code).json(response);
  }
};
