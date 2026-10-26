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

  test('exige o usuário quando os campos estão vazios', async ({
    loginPage,
    page,
  }) => {
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toContainText('Username is required');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('exige a senha quando só o usuário é preenchido', async ({
    loginPage,
    page,
  }) => {
    await loginPage.login(users.standard.username, '');

    await expect(loginPage.errorMessage).toContainText('Password is required');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});

test.describe('Sessão e acesso', () => {
  test('encerra a sessão ao fazer logout', async ({
    loggedInPage,
    loginPage,
    page,
  }) => {
    await loggedInPage.logout();

    await expect(page).toHaveURL(/saucedemo\.com\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('bloqueia o acesso direto ao inventário sem login', async ({
    loginPage,
    page,
  }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL(/saucedemo\.com\/$/);
    await expect(loginPage.errorMessage).toContainText(
      "You can only access '/inventory.html' when you are logged in"
    );
  });
});