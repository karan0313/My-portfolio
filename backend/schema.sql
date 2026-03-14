USE karan_portfolio;

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(180)  NOT NULL,
  phone       VARCHAR(20)   DEFAULT NULL,
  subject     VARCHAR(200)  NOT NULL,
  message     TEXT          NOT NULL,
  ip_address  VARCHAR(45)   DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  is_read     TINYINT(1)    DEFAULT 0
);
