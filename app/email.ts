import nodemailer from 'nodemailer'

export const transporter = CreateTransporter(process.env.LOGIN, process.env.PASSWORD);
const changePasswordMessage = 'Ваш код подтверждения для смены пароля:';
const adminPasswordMessage = 'Вас назначили администратором проекта Своей ЧГКи. Ваш временный пароль:';
const ignoreMessage = 'Если вы не запрашивали код, то проигнорируйте это сообщение';

export function CreateTransporter(user: string, password: string) {
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: user,
            pass: password,
        }
    });
}

export function makeTemporaryPassword(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export async function SendMailWithTemporaryPassword(transporter, email: string, code: string) {
    await transporter.sendMail({
        from: '"Своя ЧГК" <ownchgk@gmail.com>',
        to: email,
        subject: 'Смена пароля',
        text: changePasswordMessage + '\n' +  code + '\n' + ignoreMessage
    })
}

export async function SendMailWithTemporaryPasswordToAdmin(transporter, email: string, code: string) {
    await transporter.sendMail({
        from: '"Своя ЧГК" <ownchgk@gmail.com>',
        to: email,
        subject: 'Временный пароль',
        text: adminPasswordMessage + '\n' +  code + '\n' + ignoreMessage
    })
}

export function validateEmail(email: string) {
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return reg.test(email);
}