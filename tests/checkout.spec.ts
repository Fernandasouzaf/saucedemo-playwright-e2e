import { test, expect } from '../fixtures';
import { products } from '../data/products';
import { checkoutInfo } from '../data/checkout';

test.describe('Finalização da compra', () => {
  test('conclui uma compra completa de ponta a ponta', async ({
    loggedInPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    const product = products.backpack;

    await test.step('Adiciona o produto e abre o carrinho', async () => {
      await loggedInPage.addToCart(product.slug);
      await loggedInPage.goToCart();
      await expect(cartPage.itemNames).toHaveText(product.name);
    });

    await test.step('Inicia o checkout e preenche os dados', async () => {
      await cartPage.checkout();
      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await checkoutPage.fillInformation(checkoutInfo);
      await checkoutPage.continue();
    });

    await test.step('Revisa o pedido', async () => {
      await expect(page).toHaveURL(/checkout-step-two\.html/);
      await expect(checkoutPage.itemNames).toHaveText(product.name);
    });

    await test.step('Finaliza a compra', async () => {
      await checkoutPage.finish();
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(checkoutPage.completeHeader).toHaveText(
        'Thank you for your order!'
      );
      await expect(loggedInPage.cartBadge).toBeHidden();
    });
  });

  test('revisão do pedido mostra os itens e valores consistentes', async ({
    loggedInPage,
    cartPage,
    checkoutPage,
  }) => {
    const selected = [products.backpack, products.bikeLight];

    for (const product of selected) {
      await loggedInPage.addToCart(product.slug);
    }
    await loggedInPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(checkoutInfo);
    await checkoutPage.continue();

    await expect(checkoutPage.itemNames).toHaveText(selected.map((p) => p.name));

    const expectedSubtotal = selected.reduce((sum, p) => sum + p.price, 0);
    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('cancela o checkout e volta ao carrinho preservando o item', async ({
    loggedInPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    const product = products.backpack;

    await loggedInPage.addToCart(product.slug);
    await loggedInPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.itemNames).toHaveText(product.name);
  });
});

test.describe('Validação do formulário de checkout', () => {
  test.beforeEach(async ({ loggedInPage, cartPage }) => {
    await loggedInPage.addToCart(products.backpack.slug);
    await loggedInPage.goToCart();
    await cartPage.checkout();
  });

  const missingFieldCases = [
    {
      label: 'o nome',
      info: { ...checkoutInfo, firstName: '' },
      error: 'First Name is required',
    },
    {
      label: 'o sobrenome',
      info: { ...checkoutInfo, lastName: '' },
      error: 'Last Name is required',
    },
    {
      label: 'o CEP',
      info: { ...checkoutInfo, postalCode: '' },
      error: 'Postal Code is required',
    },
  ];

  for (const { label, info, error } of missingFieldCases) {
    test(`exige ${label} para continuar`, async ({ checkoutPage, page }) => {
      await checkoutPage.fillInformation(info);
      await checkoutPage.continue();

      await expect(checkoutPage.errorMessage).toContainText(error);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }
});