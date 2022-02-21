const Payment = require("../models/index")["Payment"];
const User = require("../models/index")["User"];

module.exports = class PaymentService {
  async initiatePayment(payment) {
    return await Payment.create(payment);
  }

  async getAllPayment() {
    return await Payment.findAll({
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
  }

  async getPayment(reference) {
    return await Payment.findOne({
      where: {
        reference,
      },
    });
  }

  async getSupporters(creatorId) {
    return await Payment.findAll({
      where: { creatorId, status: "approved" },
      order: [["createdAt", "DESC"]],
    });
  }

  async getUniqueSupporters(creatorId) {
    const supporters = await Payment.findAll({
      where: { creatorId, status: "approved" },
    });
    console.log("sup", supporters);
    let unique = [];
    let uniqueSupporters = [];
    supporters.map((item) => {
      if (unique.indexOf(item.email) === -1) {
        unique.push(item.email);
        uniqueSupporters.push(item);
      }
    });
    return uniqueSupporters;
  }

  async getAllUniqueSupporters() {
    const supporters = await Payment.findAll({
      where: { status: "approved" },
    });
    let unique = [];
    let uniqueSupporters = [];
    supporters.map((item) => {
      if (unique.indexOf(item.email) === -1) {
        unique.push(item.email);
        uniqueSupporters.push(item);
      }
    });

    return uniqueSupporters;
  }

  async getSupporterHistory(creatorId, email) {
    return await Payment.findAll({
      where: { creatorId, status: "approved", email },
    });
  }

  async getPaymentHistory(email) {
    return await Payment.findAll({
      where: { status: "approved", email },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
  }

  async verifyPayment(reference, payload) {
    return await Payment.update(payload, {
      where: {
        reference,
      },
    });
  }

  async getApprovedPayment(email) {
    return await Payment.findAll({ where: { status: "approved", email } });
  }
};
