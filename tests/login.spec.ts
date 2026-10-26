import { test, expect } from '../fixtures';
import { users } from '../data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('realiza login com credenciais válidas', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('exibe erro ao logar com senha incorreta', async ({ loginPage }) => {
    await loginPage.login(
      users.wrongPassword.username,
      users.wrongPassword.password
    );

    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match any user in this service'
    );
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('bloqueia o acesso do usuário locked_out_user', async ({ loginPage }) => {
    await loginPage.login(users.locked.username, users.locked.password);

    await expect(loginPage.errorMessage).toContainText(
      'Sorry, this user has been locked out'
    );
    await expect(loginPage.loginButton).toBeVisible();
  });
});