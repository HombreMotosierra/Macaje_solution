package com.example.demo.ecommerce;

import java.util.List;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final boolean enabled;

    public EmailService(
        ObjectProvider<JavaMailSender> mailSenderProvider,
        @Value("${app.mail.from:no-reply@macaje.local}") String fromAddress,
        @Value("${app.mail.enabled:false}") boolean enabled
    ) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.fromAddress = fromAddress;
        this.enabled = enabled;
    }

    public void sendTicketNotification(
        String ticketCode,
        String customerName,
        String customerPhone,
        List<String> adminEmails
    ) {
        if (!enabled || mailSender == null || adminEmails.isEmpty()) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(adminEmails.toArray(new String[0]));
            message.setSubject("Nuevo ticket de cotizacion: " + ticketCode);
            message.setText(
                "Se ha generado un nuevo ticket de cotizacion.\n\n" +
                "Codigo: " + ticketCode + "\n" +
                "Cliente: " + customerName + "\n" +
                "Telefono: " + customerPhone + "\n\n" +
                "Ingresa al panel de administracion para gestionar este ticket."
            );
            mailSender.send(message);
        } catch (Exception exception) {
            System.err.println("[EmailService] No se pudo enviar notificacion de ticket: " + exception.getMessage());
        }
    }
}
