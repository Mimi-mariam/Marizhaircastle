import React from "react";
import styles from "./WhatsAppButton.module.css";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({
  phoneNumber = "2349045464299",
  defaultMessage = "Hello Marizhaircastle! I would like to inquire about your luxury hair units.",
}: WhatsAppButtonProps) {
  const encodedMsg = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

  return (
    <div className={styles.container}>
      {/* Outside Floating Badge / Bubble */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.speechBubble}
        aria-label="Chat with us on WhatsApp"
      >
        <span className={styles.onlineDot} aria-hidden="true" />
        <span>Chat with us</span>
        <div className={styles.bubbleTail} aria-hidden="true" />
      </a>

      {/* WhatsApp Circular Icon Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappButton}
        aria-label="Open WhatsApp chat"
      >
        <svg
          className={styles.whatsappIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15-.2.3-.777.979-.953 1.18-.175.2-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.175-.3-.019-.462.132-.612.135-.136.3-.351.451-.527.15-.175.2-.301.3-.501.101-.2.05-.376-.025-.527-.075-.15-.677-1.633-.928-2.234-.244-.585-.492-.506-.676-.515-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.58-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.176-1.43-.075-.125-.276-.2-.577-.35z" />
          <path d="M12.004 0C5.378 0 0 5.378 0 12.003c0 2.115.553 4.184 1.603 6.007L.055 24l6.166-1.618A11.96 11.96 0 0012.004 24c6.626 0 12.004-5.378 12.004-12.003 0-6.625-5.378-12.003-12.004-12.003zm0 21.84c-1.879 0-3.717-.506-5.321-1.465l-.382-.228-3.951 1.036 1.055-3.854-.249-.397A9.833 9.833 0 012.164 12.003c0-5.426 4.414-9.839 9.84-9.839 5.426 0 9.84 4.413 9.84 9.839 0 5.426-4.414 9.837-9.84 9.837z" />
        </svg>
      </a>
    </div>
  );
}

