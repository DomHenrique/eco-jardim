import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Validates email format using regex
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generates sample budget data for testing
 */
function generateSampleBudgetData() {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    customer_id: '550e8400-e29b-41d4-a716-446655440001',
    items: [
      { id: '1', name: 'Rosa Vermelha', price: 50, quantity: 2 },
      { id: '2', name: 'Orquídea Branca', price: 120, quantity: 1 },
      { id: '3', name: 'Serviço de Paisagismo', price: 500, quantity: 1 }
    ],
    subtotal: 670,
    tax: 134,
    total: 804,
    status: 'pending',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Projeto de jardim para residência',
    created_by: '550e8400-e29b-41d4-a716-446655440002'
  };
}

/**
 * Generates sample order data for testing
 */
function generateSampleOrderData() {
  return {
    id: '660e8400-e29b-41d4-a716-446655440000',
    user_id: '660e8400-e29b-41d4-a716-446655440001',
    items: [
      { id: '1', name: 'Flor Artificial', price: 35, quantity: 3 },
      { id: '2', name: 'Vaso Cerâmico', price: 80, quantity: 1 }
    ],
    total: 185,
    userInfo: {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123, São Paulo - SP'
    },
    status: 'confirmed',
    date: new Date().toISOString(),
    delivery_address: 'Rua das Flores, 123, São Paulo - SP',
    delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Entregar com cuidado'
  };
}

async function testEmailConfiguration() {
  console.log('=== Email Configuration & Template Test ===\n');

  try {
    // Read .env.local
    const envPath = path.join(__dirname, '.env.local');
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
      }
    });

    // Check SMTP configuration
    console.log('📧 Checking SMTP Configuration...\n');
    
    const smtpConfig = {
      host: envVars['VITE_SMTP_HOST'],
      port: parseInt(envVars['VITE_SMTP_PORT'] || '587'),
      secure: envVars['VITE_SMTP_SECURE'] === 'true',
      user: envVars['VITE_SMTP_USER'],
      pass: envVars['VITE_SMTP_PASS'],
      fromName: envVars['VITE_EMAIL_FROM_NAME'],
    };

    console.log('Configuration:');
    console.log(`  Host: ${smtpConfig.host || '❌ NOT SET'}`);
    console.log(`  Port: ${smtpConfig.port}`);
    console.log(`  Secure: ${smtpConfig.secure}`);
    console.log(`  User: ${smtpConfig.user || '❌ NOT SET'}`);
    console.log(`  Password: ${smtpConfig.pass ? '✅ SET (hidden)' : '❌ NOT SET'}`);
    console.log(`  From: ${smtpConfig.fromName} <${smtpConfig.user}>`);
    console.log('');

    // Check if all required fields are set
    const missingFields = [];
    if (!smtpConfig.host) missingFields.push('VITE_SMTP_HOST');
    if (!smtpConfig.user) missingFields.push('VITE_SMTP_USER');
    if (!smtpConfig.pass) missingFields.push('VITE_SMTP_PASS');

    if (missingFields.length > 0) {
      console.log('❌ Missing required configuration:');
      missingFields.forEach(field => console.log(`   - ${field}`));
      console.log('\nPlease update your .env.local file with the missing values.');
      process.exit(1);
    }

    console.log('✅ All required fields are configured!\n');

    // Test SMTP connection
    console.log('🔌 Testing SMTP connection...\n');

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    try {
      await transporter.verify();
      console.log('✅ SMTP connection successful!\n');
    } catch (error) {
      console.log('❌ SMTP connection failed:');
      console.log(`   ${error.message}\n`);
      console.log('Please check your SMTP credentials and try again.');
      process.exit(1);
    }

    // Ask if user wants to send a test email
    console.log('📨 Do you want to send a test email? (y/n)');
    
    // For automated testing, we'll skip the interactive part
    // You can uncomment the following to send a test email automatically
    
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter recipient email (or press Enter to skip): ', async (recipientEmail) => {
      if (recipientEmail && isValidEmail(recipientEmail)) {
        console.log(`\n📤 Testing Email Templates with ${recipientEmail}...\n`);

        // Test different email templates
        const templates = [
          {
            name: 'Welcome Email',
            subject: 'Bem-vindo à Ecojardim & Pedras!',
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h1 style="color: #4CAF50;">Bem-vindo!</h1>
                <p>Olá João,</p>
                <p>Bem-vindo à Ecojardim & Pedras. Estamos felizes em ter você como cliente.</p>
              </div>
            `
          },
          {
            name: 'Order Confirmation',
            subject: 'Confirmação do Pedido #660e8400',
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h1>Confirmação de Pedido</h1>
                <p><strong>Cliente:</strong> João Silva</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="background-color: #f2f2f2;">
                    <th>Produto</th><th>Qtd</th><th>Preço</th>
                  </tr>
                  <tr>
                    <td>Flor Artificial</td><td>3</td><td>R$ 105,00</td>
                  </tr>
                </table>
                <p><strong>Total:</strong> R$ 185,00</p>
              </div>
            `
          },
          {
            name: 'Budget Notification',
            subject: 'Orçamento #550e8400 criado',
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h1>Novo Orçamento Disponível</h1>
                <p>Um novo orçamento foi criado para você.</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="background-color: #f2f2f2;">
                    <th>Item</th><th>Quantidade</th><th>Valor</th>
                  </tr>
                  <tr>
                    <td>Rosa Vermelha</td><td>2</td><td>R$ 100,00</td>
                  </tr>
                </table>
                <p><strong>Total:</strong> R$ 804,00</p>
                <p>Válido até: 30 dias</p>
              </div>
            `
          }
        ];

        for (const template of templates) {
          const mailOptions = {
            from: `${smtpConfig.fromName} <${smtpConfig.user}>`,
            to: recipientEmail,
            subject: template.subject,
            html: template.html,
          };

          try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ ${template.name}`);
            console.log(`   Message ID: ${info.messageId}`);
            console.log(`   Recipient: ${recipientEmail}\n`);
          } catch (error) {
            console.log(`❌ ${template.name} - Failed:`);
            console.log(`   ${error.message}\n`);
          }
        }

        console.log('📧 Email Template Tests Complete');
        console.log('Please check the inbox (and spam folder) of the recipient.\n');
      } else if (recipientEmail) {
        console.log(`\n❌ Invalid email format: ${recipientEmail}\n`);
      } else {
        console.log('\n⏭️  Skipping email template tests.\n');
      }

      rl.close();
      console.log('=== Test Complete ===\n');
    });

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
  }
}

testEmailConfiguration();
