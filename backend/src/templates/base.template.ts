
interface EmailAction {
  text: string;
  url: string;
}

interface EmailTemplateProps {
  title: string;
  content: string;
  action?: EmailAction;
  previewText?: string;
}

export const generateEmailTemplate = ({ title, content, action, previewText }: EmailTemplateProps): string => {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
      background-color: #f8f5f2;
      color: #4a3f3a;
      line-height: 1.6;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(74, 63, 58, 0.05);
      margin-top: 40px;
      margin-bottom: 40px;
    }
    
    .header {
      background: linear-gradient(135deg, #4a3f3a 0%, #2d2623 100%);
      padding: 40px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 40px;
      background: #ffffff;
      border-radius: 50% 50% 0 0;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    
    .title {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .content {
      padding: 40px 32px;
      text-align: right;
    }
    
    .message-box {
      background-color: #f8f5f2;
      border-right: 4px solid #c9a896;
      padding: 24px;
      border-radius: 16px;
      margin: 24px 0;
      color: #5c5c5c;
    }
    
    .action-button {
      display: inline-block;
      background: linear-gradient(90deg, #c9a896 0%, #b08d79 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: bold;
      margin-top: 24px;
      transition: transform 0.2s;
      box-shadow: 0 4px 12px rgba(201, 168, 150, 0.4);
    }
    
    .footer {
      background-color: #f8f5f2;
      padding: 32px;
      text-align: center;
      color: #8a8a8a;
      font-size: 13px;
      border-top: 1px solid #eee;
    }
    
    .social-links {
      margin-bottom: 20px;
    }
    
    .social-link {
      display: inline-block;
      margin: 0 8px;
      color: #c9a896;
      text-decoration: none;
      font-size: 20px;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .content {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText || title}
  </div>

  <div class="container">
    <div class="header">
      <div class="logo">ن</div>
      <h1 class="title">${title}</h1>
    </div>
    
    <div class="content">
      ${content}
      
      ${action ? `
        <div style="text-align: center;">
          <a href="${action.url}" class="action-button">${action.text}</a>
        </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">Instagram</a> • 
        <a href="#" class="social-link">Telegram</a> • 
        <a href="#" class="social-link">Website</a>
      </div>
      <p>نرمینه خواب - تجربه خوابی رویایی</p>
      <p style="margin-top: 8px; opacity: 0.7;">تهران، خیابان ولیعصر، پلاک ۱۲۳</p>
      <p style="margin-top: 16px; font-size: 11px; opacity: 0.5;">این ایمیل به صورت خودکار ارسال شده است</p>
    </div>
  </div>
</body>
</html>
  `;
};
