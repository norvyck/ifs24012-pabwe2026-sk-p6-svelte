import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as router from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockLinkTree = {
    id: 1,
    title: "Detail Link Tree Judul",
    description: "Detail Link Tree Deskripsi",
    type: "public",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    items: [
      { id: 101, title: "Website Resmi", url: "https://delcom.org" },
      { id: 102, title: "Instagram", url: "https://instagram.com/delcom" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner if profile or linkTree is missing", () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: null,
        linkTree: null,
      },
    });

    expect(wrapper.text()).not.toContain("Detail Link Tree Judul");

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });
    expect(wrapper2.text()).not.toContain("Detail Link Tree Judul");
  });

  it("should render correctly when linkTree id is null", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: { ...mockLinkTree, id: null },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("should not call asyncSetLinkTree if linkTreeId is not provided onMount", () => {
    const spy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    renderWithProviders(DetailPage, {
      props: { linkTreeId: null },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("should render link tree details and items correctly and support modals", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    expect(wrapper.text()).toContain("Detail Link Tree Judul");
    expect(wrapper.text()).toContain("Detail Link Tree Deskripsi");
    expect(wrapper.text()).toContain("Publik");
    expect(wrapper.text()).toContain("Website Resmi");
    expect(wrapper.text()).toContain("Instagram");

    // Back link
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const backLink = wrapper.find('[data-testid="back-to-linktrees-link"]');
    await backLink.trigger("click");
    expect(navigateSpy).toHaveBeenCalledWith("/");

    // Open & close cover modal
    const editCoverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await editCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const closeCoverBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    // Open & close edit modal
    const editDetailBtn = wrapper.find('[data-testid="edit-detail-linktree-btn"]');
    await editDetailBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeEditBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);

    // Open & close add item modal via header button
    const addItemBtn = wrapper.find('[data-testid="add-item-btn"]');
    await addItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);

    const closeItemBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);

    // Open add item modal via section button
    const addItemSectionBtn = wrapper.find('[data-testid="add-item-btn-section"]');
    await addItemSectionBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");

    // Open edit item modal
    const editItemBtn = wrapper.find('[data-testid="edit-item-101"]');
    await editItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");
  });

  it("should render unlisted and private badges and handle empty description and empty items", () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          type: "unlisted",
          description: "",
          cover: null,
          items: [],
        },
      },
    });

    expect(wrapper.text()).toContain("Unlisted");
    expect(wrapper.text()).toContain("Tidak ada deskripsi rinci untuk link tree ini.");
    expect(wrapper.text()).toContain("Belum ada tautan ditambahkan");

    const { wrapper: wrapperPrivate } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          type: "private",
          items: null,
        },
      },
    });

    expect(wrapperPrivate.text()).toContain("Privat");
  });

  it("should trigger confirm dialog and dispatch delete on delete button click when confirmed", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should not dispatch delete when cancelled", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should trigger confirm dialog and dispatch delete item when confirmed", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-101"]');
    await deleteItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteItemSpy).toHaveBeenCalledWith(1, 101);
  });

  it("should not dispatch delete item when cancelled", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-101"]');
    await deleteItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteItemSpy).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isLinkTree is true and linkTree is null", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { linkTreesStore: ltStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
        isLinkTree: false,
      },
    });

    ltStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should stay when isLinkTree is true and linkTree exists", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { wrapper, linkTreesStore: ltStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
        isLinkTree: false,
      },
    });

    navigateSpy.mockClear();
    ltStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Detail Link Tree Judul");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isLinkTreeDeleted is true", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { linkTreesStore: ltStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
        isLinkTreeDeleted: false,
      },
    });

    ltStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should trigger asyncSetLinkTree on linkTreeId change", async () => {
    const setTreeSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
    const { rerender } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    await rerender({ linkTreeId: 2 });
    await new Promise((r) => setTimeout(r, 10));

    expect(setTreeSpy).toHaveBeenCalledWith(2);
  });
});
