export const SmsTemplates = {
  LIST: {
    default: {
      to: '{{phone_number}}',
      body: 'total: {{total}}\n\nitems:\n\n{{#items}}{{name}}\n{{/items}}',
    },
    short: {
      to: '{{phone_number}}',
      body: 'Welcome {{user_name}}! Account active. Visit: https://example.com',
    },
  },
  order_confirmation: {
    default: {
      to: '{{phone_number}}',
      body: 'Hi {{user_name}},\nOrder #{{order_id}} confirmed!\nTotal: ${{order_total}}\nEst. Delivery: {{delivery_date}}',
    },
    short: {
      to: '{{phone_number}}',
      body: 'Hi {{user_name}}, Order #{{order_id}} confirmed. Total: ${{order_total}}',
    },
  },
};
