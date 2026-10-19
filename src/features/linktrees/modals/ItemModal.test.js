import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ItemModal", () => {
  const mockItem = { id: 10, title: "My Portfolio", url: "https://portfolio.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should validate empty title and empty url in add mode", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Valid Title");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");
  });

  it("should dispatch asyncSetIsItemAdd in add mode and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null, onClose: closeSpy },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });

    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsItemAdd").mockReturnValue(Promise.resolve());
    const fetchTreeSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    await titleInput.setValue("Instagram");
    await urlInput.setValue("https://instagram.com/myuser");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "Instagram", "https://instagram.com/myuser");

    // Simulate completion
    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchTreeSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsItemChange in edit mode and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem, onClose: closeSpy },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });

    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("My Portfolio");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("https://portfolio.com");

    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsItemChange").mockReturnValue(Promise.resolve());
    const fetchTreeSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Updated Portfolio");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, 10, "Updated Portfolio", "https://portfolio.com");

    // Simulate completion
    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchTreeSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should use empty values when the item has no title or URL", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: {
        show: true,
        linkTreeId: 1,
        item: { id: 10, title: "", url: "" },
      },
    });

    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("");
  });

  it("should close after adding an item without refreshing when the link tree ID is missing", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: null, item: null, onClose: closeSpy },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });
    const fetchTreeSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockReturnValue(Promise.resolve());

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchTreeSpy).not.toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should close after editing an item without refreshing when the link tree ID is missing", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: null, item: mockItem, onClose: closeSpy },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });
    const fetchTreeSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockReturnValue(Promise.resolve());

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchTreeSpy).not.toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should handle isItemAdd true when isItemAdded is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should handle isItemChange true when isItemChanged is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should trigger onClose on cancel or close button click", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-item-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback prop", async () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});
