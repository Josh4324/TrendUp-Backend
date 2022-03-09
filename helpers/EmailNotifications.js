const mailer = require("../config/mailerConfig");
const template = require("./EmailTemplate");

class EmailNotifications {
  /**
   *
   * @param {object} req Request Object
   * @param {object} user User
   * @param {string} resetToken Reset Token
   * @returns {function} returns a function
   */
  static async sendPasswordResetMail(firstName, email, link) {
    const subject = "Password Recovery";
    const image = "";
    const emailBody = `
        <h3 class="username">Hello ${firstName},</h3>
        <p class="message">
          Click the link below to reset your password
        </p>
        <a class="btn" href=${link}>
          Reset password
        </a>`;
    const content = template(subject, emailBody, image);
    mailer.sendMail(email, subject, content);
  }

  /**
   * @param {*} email
   * @param {*} code
   * @param {*} name
   * @returns {*} sends an email to a new user
   */
  static async signupEmail(email, code, name) {
    //const dbMessage = await EmailNotification.findOne({ where: { type: 'signup' }});
    //const { message: signupMessage, image } = dbMessage;
    const image = "";
    const title = "Welcome to TrendUpp";
    const body = `

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
     
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                      <p>Dear new User</p>

                        Welcome to TrendUpp! We are excited to have you! <br/><br/>      
                          
                        <p class="message">Please use this code to verify your email and complete your account set up. The code will be valid for the next 10 minutes.</p> <br>
                       
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td><h3 align="center" class="center black">${code}</h3></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- END CENTERED WHITE CONTAINER -->

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">TrendUpp, Lagos, Nigeria</span>
                   <!--  <br> Don't like these emails? <a href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>. -->
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by">
                    Powered by <a href="#">TrendUpp</a>.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
       
       `;
    const message = template(title, body, image);
    mailer.sendMail(email, title, message);
  }

  static async paymentEmail(email) {
    //const dbMessage = await EmailNotification.findOne({ where: { type: 'signup' }});
    //const { message: signupMessage, image } = dbMessage;
    const image = "";
    const title = "You just received a payment from a fan";
    const body = `

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
     
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                      <p>Dear Creator</p>

                       You just received a payment from a fan <br/><br/>   

                       Login to trendUpp to see who just paid you.   
                       
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td><h3 align="center" class="center black"></h3></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- END CENTERED WHITE CONTAINER -->

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">TrendUpp, Lagos, Nigeria</span>
                   <!--  <br> Don't like these emails? <a href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>. -->
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by">
                    Powered by <a href="#">TrendUpp</a>.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
       
       `;
    const message = template(title, body, image);
    mailer.sendMail(email, title, message);
  }

  static async anonymousSignupEmail(email, name, password) {
    //const dbMessage = await EmailNotification.findOne({ where: { type: 'signup' }});
    //const { message: signupMessage, image } = dbMessage;
    const image = "";
    const title = "Welcome to TrendUpp";
    const body = `

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
     
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                      <p>Dear ${name}</p>

                        Welcome to TrendUpp! We are excited to have you! <br/><br/>      
                          
                        <p class="message">Please use this password below to Log in.</p> <br>
                       
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                              <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td><h3 align="center" class="center black">${password}</h3></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- END CENTERED WHITE CONTAINER -->

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">TrendUpp, Lagos, Nigeria</span>
                   <!--  <br> Don't like these emails? <a href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>. -->
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by">
                    Powered by <a href="#">TrendUpp</a>.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
       
       `;
    const message = template(title, body, image);
    mailer.sendMail(email, title, message);
  }
}

module.exports = EmailNotifications;
