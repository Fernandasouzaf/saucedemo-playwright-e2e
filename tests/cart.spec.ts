import { test, expect } from '../fixtures';
import { products } from '../data/products';

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

test.describe('Carrinho', () => {
  test('adiciona um produto e atualiza o badge e o botão', async ({
    loggedInPage,
  }) => {
    const { slug } = products.backpack;

    await loggedInPage.addToCart(slug);

    await expect(loggedInPage.cartBadge).toHaveText('1');
    await expect(loggedInPage.removeButton(slug)).toBeVisible();
    await expect(loggedInPage.addToCartButton(slug)).toBeHidden();
  });

  test('exibe no carrinho o produto com nome, preço e quantidade corretos', async ({
    loggedInPage,
    cartPage,
    page,
  }) => {
    const product = products.backpack;

    await loggedInPage.addToCart(product.slug);
    await loggedInPage.goToCart();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText(product.name);
    await expect(cartPage.itemPrices).toHaveText(formatPrice(product.price));
    await expect(cartPage.itemQuantities).toHaveText('1');
  });

  test('adiciona vários produtos e mantém todos no carrinho', async ({
    loggedInPage,
    cartPage,
  }) => {
    const selected = [products.backpack, products.bikeLight, products.boltTShirt];

    for (const product of selected) {
      await loggedInPage.addToCart(product.slug);
    }
    await expect(loggedInPage.cartBadge).toHaveText(String(selected.length));

    await loggedInPage.goToCart();

    await expect(cartPage.items).toHaveCount(selected.length);
    await expect(cartPage.itemNames).toHaveText(selected.map((p) => p.name));
    await expect(cartPage.itemPrices).toHaveText(
      selected.map((p) => formatPrice(p.price))
    );
  });

  test('remove um produto do carrinho e mantém os demais', async ({
    loggedInPage,
    cartPage,
  }) => {
    const removed = products.backpack;
    const kept = products.bikeLight;

    await loggedInPage.addToCart(removed.slug);
    await loggedInPage.addToCart(kept.slug);
    await loggedInPage.goToCart();
    await expect(cartPage.items).toHaveCount(2);

    await cartPage.removeButton(removed.slug).click();

    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemNames).toHaveText(kept.name);
    await expect(loggedInPage.cartBadge).toHaveText('1');
  });

  test('continua comprando e preserva o item no carrinho', async ({
    loggedInPage,
    cartPage,
    page,
  }) => {
    const { slug } = products.backpack;

    await loggedInPage.addToCart(slug);
    await loggedInPage.goToCart();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(loggedInPage.removeButton(slug)).toBeVisible();
    await expect(loggedInPage.cartBadge).toHaveText('1');
  });
});