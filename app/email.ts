import nodemailer from 'nodemailer'

export function CreateTransporter(user:string, password:string) {
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: user,
            pass: password,
        }
    });
}

export function SendMailWithTemporaryPassword(transporter, email: string, code: string) {
    transporter.sendMail({
        from: '"Своя ЧГК" <ownchgk@gmail.com>',
        to: email,
        subject: 'Change password',
        text: 'This message was sent you to change your password \n Your code to enter: ' + code
    })
}