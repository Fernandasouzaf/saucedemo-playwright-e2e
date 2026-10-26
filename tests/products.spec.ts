import { test, expect } from '../fixtures';
import { products } from '../data/products';
import type { SortOption } from '../pages/InventoryPage';

test.describe('Listagem e navegação de produtos', () => {
  test('exibe o catálogo com 6 produtos completos', async ({
    loggedInPage,
    page,
  }) => {
    await expect(loggedInPage.items).toHaveCount(6);
    await expect(loggedInPage.itemNames).toHaveCount(6);
    await expect(loggedInPage.itemPrices).toHaveCount(6);
    await expect(
      page.getByRole('button', { name: 'Add to cart' })
    ).toHaveCount(6);
  });

  const sortCases: {
    label: string;
    option: SortOption;
    by: 'name' | 'price';
    descending: boolean;
  }[] = [
    { label: 'nome de A a Z', option: 'az', by: 'name', descending: false },
    { label: 'nome de Z a A', option: 'za', by: 'name', descending: true },
    { label: 'preço do menor para o maior', option: 'lohi', by: 'price', descending: false },
    { label: 'preço do maior para o menor', option: 'hilo', by: 'price', descending: true },
  ];

  for (const { label, option, by, descending } of sortCases) {
    test(`ordena os produtos por ${label}`, async ({ loggedInPage }) => {
      await loggedInPage.sortBy(option);

      if (by === 'name') {
        const original = await loggedInPage.getNames();
        const expected = [...original].sort();
        if (descending) expected.reverse();

        await expect.poll(() => loggedInPage.getNames()).toEqual(expected);
      } else {
        const original = await loggedInPage.getPrices();
        const expected = [...original].sort((a, b) =>
          descending ? b - a : a - b
        );

        await expect.poll(() => loggedInPage.getPrices()).toEqual(expected);
      }
    });
  }

  test('abre os detalhes de um produto com os mesmos dados da listagem', async ({
    loggedInPage,
    productDetailPage,
    page,
  }) => {
    const product = products.backpack;
    const listedItem = loggedInPage.items.filter({ hasText: product.name });
    const listedDescription = await listedItem
      .getByTestId('inventory-item-desc')
      .innerText()

    await loggedInPage.openProduct(product.name);

    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(productDetailPage.name).toHaveText(product.name);
    await expect(productDetailPage.description).toHaveText(listedDescription);
    await expect(productDetailPage.price).toHaveText(
      `$${product.price.toFixed(2)}`
    );
  });
});