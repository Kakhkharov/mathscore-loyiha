const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'mathscore.uzbekistan@gmail.com', // placeholder
    pass: process.env.EMAIL_PASS || 'password_here' // app password
  }
});

const sendStudentCredentials = async (email, name, password) => {
  const mailOptions = {
    from: '"MathScore" <no-reply@mathscore.uz>',
    to: email,
    subject: 'MathScore Tizimiga Xush Kelibsiz! (Kirish ma\'lumotlari)',
    html: `
      <h2>Assalomu alaykum, ${name}!</h2>
      <p>Siz MathScore platformasiga muvaffaqiyatli qo'shildingiz.</p>
      <p>Tizimga kirish uchun ma'lumotlaringiz:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Parol:</strong> ${password}</li>
      </ul>
      <p>Iltimos, tizimga kirgandan so'ng parolingizni o'zgartiring.</p>
      <br/>
      <a href="http://localhost:5174/" style="padding: 10px 20px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 5px;">Platformaga Kirish</a>
    `
  };
  try {
    console.log(`[MAILER] Yangi student ro'yxatdan o'tdi:\n  Email: ${email}\n  Muvaqqat Parol: ${password}`);
    if (process.env.EMAIL_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`[MAILER] Xat muvaffaqiyatli yuborildi: ${email}`);
    } else {
      console.log('[MAILER] Email jo\'natilmadi: EMAIL_USER .env faylida ko\'rsatilmagan.');
    }
  } catch (error) {
    console.error('[MAILER] Email yuborishda xatolik:', error);
  }
};

const sendPasswordReset = async (email, name, resetLink) => {
  const mailOptions = {
    from: '"MathScore" <no-reply@mathscore.uz>',
    to: email,
    subject: 'MathScore - Parolni tiklash',
    html: `
      <h2>Assalomu alaykum, ${name}!</h2>
      <p>Siz parolingizni tiklash bo'yicha so'rov yubordingiz.</p>
      <p>Yangi parol o'rnatish uchun quyidagi tugmani bosing:</p>
      <br/>
      <a href="${resetLink}" style="padding: 10px 20px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 5px;">Parolni Tiklash</a>
      <br/><br/>
      <p>Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
    `
  };
  try {
    console.log(`[MAILER] Parol tiklash so'rovi:\n  Email: ${email}\n  Havola: ${resetLink}`);
    if (process.env.EMAIL_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`[MAILER] Tiklash xati muvaffaqiyatli yuborildi: ${email}`);
    } else {
      console.log('[MAILER] Email jo\'natilmadi: EMAIL_USER .env faylida ko\'rsatilmagan.');
    }
  } catch (error) {
    console.error('[MAILER] Email yuborishda xatolik:', error);
  }
};

const sendPasswordChangeNotification = async (email, name, newPassword) => {
  const mailOptions = {
    from: '"MathScore" <no-reply@mathscore.uz>',
    to: email,
    subject: 'MathScore - Parolingiz o\'zgartirildi',
    html: `
      <h2>Assalomu alaykum, ${name}!</h2>
      <p>Sizning MathScore platformasidagi akkauntingiz paroli muvaffaqiyatli o'zgartirildi.</p>
      <p><strong>Yangi parolingiz:</strong> ${newPassword}</p>
      <br/>
      <p>Agar bu harakatni siz amalga oshirmagan bo'lsangiz, zudlik bilan platformaga kirib parolingizni tiklang yoki ma'muriyatga murojaat qiling.</p>
      <br/>
      <a href="http://localhost:5173/" style="padding: 10px 20px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 5px;">Platformaga Kirish</a>
    `
  };
  try {
    console.log(`[MAILER] Parol o'zgarishi yuborildi: ${email}`);
    if (process.env.EMAIL_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`[MAILER] Xat muvaffaqiyatli yuborildi: ${email}`);
    } else {
      console.log('[MAILER] Email jo\'natilmadi: EMAIL_USER kiritilmagan.');
    }
  } catch (error) {
    console.error('[MAILER] Email yuborishda xatolik:', error);
  }
};

module.exports = { sendStudentCredentials, sendPasswordReset, sendPasswordChangeNotification };
