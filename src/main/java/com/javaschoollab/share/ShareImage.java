package com.javaschoollab.share;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.imageio.ImageIO;

/** The 1200x630 preview card WhatsApp, LinkedIn and Telegram show for a shared lesson or course: icon tile, title, course line, site name. */
final class ShareImage {

    static final int W = 1200;
    static final int H = 630;

    private static final Color BG = new Color(0xFB, 0xF7, 0xF2);
    private static final Color TILE = new Color(0xFF, 0xF1, 0xDE);
    private static final Color TILE_EDGE = new Color(0xFB, 0xDB, 0xB4);
    private static final Color ORANGE = new Color(0xF2, 0x6B, 0x1D);
    private static final Color INK = new Color(0x14, 0x17, 0x2B);
    private static final Color MUTED = new Color(0x6B, 0x6F, 0x80);

    private ShareImage() {}

    /** @param title the lesson or course name; @param line the course and module it belongs to; @param footer the small line at the bottom */
    static byte[] render(String title, String line, String footer) throws IOException {
        BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setColor(BG);
            g.fillRect(0, 0, W, H);

            // icon tile, the same look as the lesson header: soft orange square, an orange dot and four small operator marks
            int x = 90, y = 80, size = 190;
            g.setColor(TILE);
            g.fill(new RoundRectangle2D.Float(x, y, size, size, 44, 44));
            g.setColor(TILE_EDGE);
            g.setStroke(new BasicStroke(3f));
            g.draw(new RoundRectangle2D.Float(x, y, size, size, 44, 44));
            g.setColor(ORANGE);
            g.fill(new Ellipse2D.Float(x + size / 2f - 13, y + size / 2f - 13, 26, 26));
            g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 34));
            centred(g, "/", x + size / 2, y + 52);
            centred(g, "-", x + size / 2, y + size - 36);
            centred(g, "+", x + 46, y + size / 2 + 12);
            centred(g, "×", x + size - 46, y + size / 2 + 12);

            // title, wrapped; shrinks once when it needs more than two lines
            Font titleFont = new Font(Font.SANS_SERIF, Font.BOLD, 76);
            g.setFont(titleFont);
            List<String> lines = wrap(g.getFontMetrics(), title, W - 180);
            if (lines.size() > 2) {
                g.setFont(titleFont.deriveFont(58f));
                lines = wrap(g.getFontMetrics(), title, W - 180);
            }
            g.setColor(INK);
            int ty = lines.size() == 1 ? 400 : lines.size() == 2 ? 365 : 340;
            for (String l : lines.subList(0, Math.min(3, lines.size()))) {
                g.drawString(l, 90, ty);
                ty += g.getFontMetrics().getHeight() - 4;
            }

            g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 34));
            g.setColor(MUTED);
            g.drawString(fit(g.getFontMetrics(), line, W - 180), 90, 520);

            Font brand = new Font(Font.SANS_SERIF, Font.BOLD, 30);
            g.setColor(ORANGE);
            g.fill(new Ellipse2D.Float(90, 566, 16, 16));
            g.setFont(brand);
            g.setColor(INK);
            g.drawString("JavaSchoolLab", 118, 582);
            int brandWidth = g.getFontMetrics().stringWidth("JavaSchoolLab");
            g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 28));
            g.setColor(MUTED);
            g.drawString(footer, 118 + brandWidth + 24, 582);
        } finally {
            g.dispose();
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }

    private static void centred(Graphics2D g, String s, int cx, int baseline) {
        g.setColor(ORANGE);
        g.drawString(s, cx - g.getFontMetrics().stringWidth(s) / 2, baseline);
    }

    static List<String> wrap(FontMetrics fm, String text, int maxWidth) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        for (String word : text.split("\\s+")) {
            String next = cur.length() == 0 ? word : cur + " " + word;
            if (cur.length() > 0 && fm.stringWidth(next) > maxWidth) {
                out.add(cur.toString());
                cur = new StringBuilder(word);
            } else {
                cur = new StringBuilder(next);
            }
        }
        if (cur.length() > 0) out.add(cur.toString());
        return out;
    }

    private static String fit(FontMetrics fm, String s, int maxWidth) {
        if (fm.stringWidth(s) <= maxWidth) return s;
        String t = s;
        while (t.length() > 1 && fm.stringWidth(t + "…") > maxWidth) t = t.substring(0, t.length() - 1);
        return t + "…";
    }
}
