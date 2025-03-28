import bcrypt from 'bcryptjs';

const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    firstName: 'Admin',
    lastName: 'User',
    phone: '555-000-0000',
    isAdmin: true,
    addresses: [
      {
        type: 'shipping',
        isDefault: true,
        street: 'Av. Administrador 100',
        city: 'Querétaro',
        state: 'Querétaro',
        zipCode: '76000',
        country: 'México'
      }
    ]
  },
  {
    username: 'john',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
    firstName: 'John',
    lastName: 'Doe',
    phone: '555-111-1111',
    addresses: [
      {
        type: 'shipping',
        isDefault: true,
        street: 'Calle Principal 123',
        city: 'Querétaro',
        state: 'Querétaro',
        zipCode: '76000',
        country: 'México'
      },
      {
        type: 'billing',
        isDefault: true,
        street: 'Av. Facturación 456',
        city: 'Querétaro',
        state: 'Querétaro',
        zipCode: '76010',
        country: 'México'
      }
    ]
  },
  {
    username: 'jane',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '555-222-2222',
    addresses: [
      {
        type: 'shipping',
        isDefault: true,
        street: 'Av. Entrega 789',
        city: 'Querétaro',
        state: 'Querétaro',
        zipCode: '76020',
        country: 'México'
      }
    ]
  }
];

export default users;