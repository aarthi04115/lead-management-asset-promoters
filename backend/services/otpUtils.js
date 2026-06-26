const crypto = require("crypto");

const otpUtils = {
  generate: function () {
    return crypto.randomInt(100000, 999999).toString();
  },

  hash: function (otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
  },

  verify: function (otp, hashedOtp) {
    const otpHash = this.hash(otp);
    return otpHash === hashedOtp;
  },
};

module.exports = otpUtils;
