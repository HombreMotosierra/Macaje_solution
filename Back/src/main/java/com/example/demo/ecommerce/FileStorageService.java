package com.example.demo.ecommerce;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path uploadPath;
    private final String publicBaseUrl;

    public FileStorageService(
        @Value("${app.upload.dir:uploads}") String uploadDir,
        @Value("${app.public.base-url:http://localhost:8080}") String publicBaseUrl
    ) {
        this.uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl;
    }

    public UploadResponse storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(400, "Debes seleccionar una imagen");
        }

        String originalName = file.getOriginalFilename() == null ? "imagen" : file.getOriginalFilename();
        String extension = extensionOf(originalName).toLowerCase(Locale.ROOT);
        if (!(extension.equals("jpg") || extension.equals("jpeg") || extension.equals("png") || extension.equals("webp"))) {
            throw new ApiException(400, "Formato no soportado. Usa jpg, jpeg, png o webp");
        }

        String fileName = Instant.now().toEpochMilli() + "-" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;

        try {
            Files.createDirectories(uploadPath);
            Path destination = uploadPath.resolve(fileName);
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ApiException(500, "No se pudo guardar la imagen");
        }

        String url = publicBaseUrl + "/uploads/" + fileName;
        return new UploadResponse(fileName, url, file.getSize());
    }

    public String uploadAbsolutePath() {
        return uploadPath.toString();
    }

    private String extensionOf(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            return "";
        }
        return filename.substring(index + 1);
    }
}
