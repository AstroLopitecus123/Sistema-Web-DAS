package com.web.capas.application.service;

import com.web.capas.domain.ServiceException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.url.frontend}")
    private String frontendUrl;

    public void enviarCorreoRecuperacion(String emailDestino, String token, String nombreUsuario) {
        try {
            System.out.println("Enviando correo a: " + emailDestino);
            
            String enlaceRecuperacion = frontendUrl + "/restablecer-contrasena?token=" + token;
            
            String htmlTemplate = cargarPlantillaHTML();
            
            String htmlContent = htmlTemplate.replace("{{nombreUsuario}}", nombreUsuario)
                                             .replace("{{enlaceRecuperacion}}", enlaceRecuperacion);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(emailDestino);
            helper.setSubject("Recuperación de Contraseña - Tienda De Alimentos Online S.A.");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            
            System.out.println("Correo enviado exitosamente");

        } catch (MessagingException e) {
            throw new ServiceException("Error al enviar el correo de recuperación", e);
        }
    }

    private String cargarPlantillaHTML() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/email/recuperacion_contrasena.html");
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            System.err.println("Error al cargar la plantilla HTML: " + e.getMessage());
            return "<h2>Recuperación de Contraseña</h2><p>Hola {{nombreUsuario}}, haz clic <a href='{{enlaceRecuperacion}}'>aquí</a> para restablecer tu contraseña.</p>";
        }
    }
}
