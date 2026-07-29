import React from 'react'
import styled from 'styled-components'
import { useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useToast } from '../ToastProvider';

const Container = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
position: relative;
z-index: 1;
align-items: center;
@media (max-width: 960px) {
    padding: 0px;
}
`

const Wrapper = styled.div`
position: relative;
display: flex;
justify-content: space-between;
align-items: center;
flex-direction: column;
width: 100%;
max-width: 1350px;
padding: 0px 0px 80px 0px;
gap: 12px;
@media (max-width: 960px) {
    flex-direction: column;
}
`

const Title = styled.div`
font-size: 42px;
text-align: center;
font-weight: 600;
margin-top: 20px;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
      margin-top: 12px;
      font-size: 32px;
  }
`;

const Desc = styled.div`
    font-size: 18px;
    text-align: center;
    max-width: 600px;
    color: ${({ theme }) => theme.text_secondary};
    @media (max-width: 768px) {
        margin-top: 12px;
        font-size: 16px;
    }
`;


const ContactForm = styled.form`
  width: 95%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.card};
  padding: 32px;
  border-radius: 16px;
  box-shadow: rgba(23, 92, 230, 0.15) 0px 4px 24px;
  margin-top: 28px;
  gap: 12px;
`

const ContactTitle = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`

const ContactInput = styled.input`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
`

const ContactInputMessage = styled.textarea`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
`

const ContactButton = styled.input`
  width: 100%;
  text-decoration: none;
  text-align: center;
  background: hsla(271, 100%, 50%, 1);
  background: linear-gradient(225deg, hsla(271, 100%, 50%, 1) 0%, hsla(294, 100%, 50%, 1) 100%);
  background: -moz-linear-gradient(225deg, hsla(271, 100%, 50%, 1) 0%, hsla(294, 100%, 50%, 1) 100%);
  background: -webkit-linear-gradient(225deg, hsla(271, 100%, 50%, 1) 0%, hsla(294, 100%, 50%, 1) 100%);
  padding: 13px 16px;
  margin-top: 2px;
  border-radius: 12px;
  border: none;
  color: ${({ theme }) => theme.text_primary};
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  ${({ disabled }) => disabled && `
    opacity: 0.7;
    cursor: not-allowed;
  `}
`

const FloatingWhatsApp = styled.a`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #25D366;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  text-decoration: none;
  font-size: 30px;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.08);
  }
`

const Contact = () => {
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const form = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(form.current);
    const fromEmail = formData.get('from_email')?.toString().trim();
    const fromName = formData.get('from_name')?.toString().trim();
    const subject = formData.get('subject')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    if (!fromEmail || !fromName || !subject || !message) {
      showToast('Please fill out all fields before sending.', 'error');
      return;
    }

    const apiKey = process.env.REACT_APP_RESEND_API_KEY;
    const fromAddress = process.env.REACT_APP_RESEND_FROM_EMAIL;
    const toAddress = process.env.REACT_APP_RESEND_TO_EMAIL || fromAddress;

    if (!apiKey || !fromAddress || !toAddress) {
      showToast('Resend is not configured yet. Please add your API keys in the environment variables.', 'error');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toAddress],
          reply_to: fromEmail,
          subject: `Portfolio Contact: ${subject}`,
          html: `
            <p><strong>Name:</strong> ${fromName}</p>
            <p><strong>Email:</strong> ${fromEmail}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br />')}</p>
          `,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to send the message right now.');
      }

      form.current.reset();
      showToast('Email sent successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Something went wrong while sending the email.', 'error');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Container>
      <Wrapper>
        <Title>Contact</Title>
        <Desc>Feel free to reach out to me for any questions or opportunities!</Desc>
        <ContactForm ref={form} onSubmit={handleSubmit}>
          <ContactTitle>Email Me 🚀</ContactTitle>
          <ContactInput placeholder="Your Email" name="from_email" type="email" />
          <ContactInput placeholder="Your Name" name="from_name" />
          <ContactInput placeholder="Subject" name="subject" />
          <ContactInputMessage placeholder="Message" rows="4" name="message" />
          <ContactButton type="submit" value={isSending ? 'Sending...' : 'Send'} disabled={isSending} />
        </ContactForm>
        <FloatingWhatsApp href="https://wa.me/916263131211?text=Hi%20Gautam%2C%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20connect." target="_blank" aria-label="Chat on WhatsApp">
          <FaWhatsapp />
        </FloatingWhatsApp>
      </Wrapper>
    </Container>
  )
}

export default Contact