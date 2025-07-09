import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.util.Properties;

public class WeatherServer {

    private static String API_KEY = "";

    public static void main(String[] args) throws IOException {

        loadEnv();

        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/api/weather", WeatherServer::handleWeatherRequest);
        server.setExecutor(null);
        server.start();
        System.out.println("Java server running on http://localhost:8000");
    }

    private static void loadEnv() {
        try {
            Properties props = new Properties();
            FileInputStream fis = new FileInputStream(".env");
            props.load(fis);
            API_KEY = props.getProperty("OPENWEATHER_API_KEY");
            fis.close();

            if (API_KEY == null || API_KEY.isEmpty()) {
                System.err.println("API key not found in .env file!");
                System.exit(1);
            }
        } catch (IOException e) {
            System.err.println("Failed to load .env file: " + e.getMessage());
            System.exit(1);
        }
    }

    private static void handleWeatherRequest(HttpExchange exchange) throws IOException {
        if (!exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        URI uri = exchange.getRequestURI();
        String query = uri.getQuery(); // e.g. lat=5.6&lon=-0.2 or city=Accra

        String city = null;
        Double lat = null, lon = null;

        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length == 2) {
                switch (pair[0]) {
                    case "city" -> city = URLDecoder.decode(pair[1], "UTF-8");
                    case "lat" -> lat = Double.parseDouble(pair[1]);
                    case "lon" -> lon = Double.parseDouble(pair[1]);
                }
            }
        }

        if ((city == null && (lat == null || lon == null))) {
            String error = "{\"error\":\"Missing city or lat/lon params\"}";
            exchange.sendResponseHeaders(400, error.length());
            exchange.getResponseBody().write(error.getBytes());
            exchange.close();
            return;
        }

        String currentUrl, forecastUrl;
        if (city != null) {
            currentUrl = String.format("https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric",
                    city, API_KEY);
            forecastUrl = String.format("https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=metric",
                    city, API_KEY);
        } else {
            currentUrl = String.format(
                    "https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric", lat, lon,
                    API_KEY);
            forecastUrl = String.format(
                    "https://api.openweathermap.org/data/2.5/forecast?lat=%f&lon=%f&appid=%s&units=metric", lat, lon,
                    API_KEY);
        }

        HttpClient client = HttpClient.newHttpClient();
        String currentJson = fetchData(client, currentUrl);
        String forecastJson = fetchData(client, forecastUrl);

        // Merge both JSON responses into one object
        String mergedJson = "{ \"current\": " + currentJson + ", \"forecast\": " + forecastJson + " }";

        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*"); // 👈 ADD THIS
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET"); // Optional but good

        exchange.sendResponseHeaders(200, mergedJson.getBytes().length);
        exchange.getResponseBody().write(mergedJson.getBytes());
        exchange.close();
    }

    private static String fetchData(HttpClient client, String url) throws IOException {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (Exception e) {
            return "{\"error\": \"Failed to fetch\"}";
        }
    }
}
