(() => {
  const currencyFormat = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const selectors = {
    navbar: ".navbar",
    navLinks: ".nav-links",
    menuToggle: ".menu-toggle",
    loadingScreen: ".loading-screen",
    toTop: ".to-top",
    toastContainer: ".toast-container",
    reveal: ".reveal, .reveal-left, .reveal-right",
    orderToggle: "[data-order-toggle]",
    orderDock: ".order-dock",
    orderItems: "[data-order-items]",
    orderSubtotal: "[data-order-subtotal]",
    orderTax: "[data-order-tax]",
    orderTotal: "[data-order-total]",
    clearOrder: "[data-clear-order]",
    placeOrder: "[data-place-order]",
    addToOrder: "[data-add-to-order]",
    filterGroup: "[data-filter-group]",
    filterButton: "[data-filter-button]",
    filterItem: "[data-filter-item]",
    galleryFilterButton: "[data-gallery-filter]",
    galleryItem: "[data-gallery-item]",
    galleryLightbox: ".lightbox",
    galleryLightboxImg: "[data-lightbox-image]",
    galleryLightboxTitle: "[data-lightbox-title]",
    galleryLightboxCounter: "[data-lightbox-counter]",
    galleryLightboxClose: "[data-lightbox-close]",
    galleryLightboxPrev: "[data-lightbox-prev]",
    galleryLightboxNext: "[data-lightbox-next]",
    reservationForm: "[data-reservation-form]",
    contactForm: "[data-contact-form]",
    reservationPreview: "[data-reservation-preview]",
    statCounter: ".counter",
  };

  const orderStorageKey = "hungryTaleOrder";
  const reservationStorageKey = "hungryTaleReservation";

  const orderState = loadOrder();
  let galleryState = {
    items: [],
    currentIndex: 0,
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLoading();
    initNavigation();
    initRevealAnimations();
    initBackToTop();
    initToasts();
    initOrderSystem();
    initMenuFilters();
    initGallery();
    initStats();
    initReservationForm();
    initContactForm();
    initActiveNav();
    initSmoothScroll();
    initParallax();
    renderReservationPreview();
    setTimeout(() => hideLoading(), 600);
  });

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function formatPrice(value) {
    return currencyFormat.format(value).replace("₹", "₹");
  }

  function normalizeToken(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function initLoading() {
    document.body.classList.add("no-scroll");
  }

  function hideLoading() {
    const loading = qs(selectors.loadingScreen);
    if (loading) {
      loading.classList.add("hide");
      setTimeout(() => loading.remove(), 500);
    }
    document.body.classList.remove("no-scroll");
  }

  function initNavigation() {
    const navbar = qs(selectors.navbar);
    const navLinks = qs(selectors.navLinks);
    const menuToggle = qs(selectors.menuToggle);

    const handleScroll = () => {
      if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
      }
      const toTop = qs(selectors.toTop);
      if (toTop) {
        toTop.classList.toggle("visible", window.scrollY > 500);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () => {
        const expanded = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(expanded));
      });

      qsa("a", navLinks).forEach((link) => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });

      document.addEventListener("click", (event) => {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
          navLinks.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  function initSmoothScroll() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function initRevealAnimations() {
    const targets = qsa(selectors.reveal);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    targets.forEach((target) => observer.observe(target));
  }

  function initBackToTop() {
    const toTop = qs(selectors.toTop);
    if (!toTop) return;
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initToasts() {
    if (!qs(selectors.toastContainer)) {
      const toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";
      toastContainer.setAttribute("aria-live", "polite");
      document.body.appendChild(toastContainer);
    }
  }

  function showToast(message, type = "info") {
    const container = qs(selectors.toastContainer);
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(24px)";
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  function loadOrder() {
    try {
      const saved = localStorage.getItem(orderStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function saveOrder() {
    localStorage.setItem(orderStorageKey, JSON.stringify(orderState));
  }

  function initOrderSystem() {
    const orderToggle = qs(selectors.orderToggle);
    const orderDock = qs(selectors.orderDock);
    const orderItems = qs(selectors.orderItems);
    const clearOrder = qs(selectors.clearOrder);
    const placeOrder = qs(selectors.placeOrder);

    if (orderToggle && orderDock) {
      orderToggle.addEventListener("click", () => {
        const isOpen = orderDock.classList.toggle("open");
        orderToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    document.addEventListener("click", (event) => {
      const addButton = event.target.closest(selectors.addToOrder);
      if (addButton) {
        const item = {
          id: addButton.dataset.id,
          name: addButton.dataset.name,
          price: Number(addButton.dataset.price),
          image: addButton.dataset.image,
        };
        addOrderItem(item);
        if (orderDock) orderDock.classList.add("open");
        if (orderToggle) orderToggle.setAttribute("aria-expanded", "true");
        showToast(`${item.name} added to your order.`, "success");
      }

      const qtyButton = event.target.closest("[data-qty-change]");
      if (qtyButton) {
        const id = qtyButton.dataset.id;
        const change = Number(qtyButton.dataset.qtyChange);
        updateOrderQuantity(id, change);
      }

      const removeButton = event.target.closest("[data-remove-item]");
      if (removeButton) {
        removeOrderItem(removeButton.dataset.removeItem);
        showToast("Item removed from your order.", "info");
      }
    });

    if (clearOrder) {
      clearOrder.addEventListener("click", () => {
        orderState.splice(0, orderState.length);
        saveOrder();
        renderOrder();
        showToast("Order cleared.", "info");
      });
    }

    if (placeOrder) {
      placeOrder.addEventListener("click", () => {
        if (!orderState.length) {
          showToast("Your order is empty.", "error");
          return;
        }
        showToast("Order placed successfully! Thank you for choosing The Hungry Tale.", "success");
      });
    }

    renderOrder();
    if (orderItems) {
      orderItems.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          const button = event.target.closest("button[data-qty-change]");
          if (button) {
            event.preventDefault();
            updateOrderQuantity(button.dataset.id, event.key === "ArrowUp" ? 1 : -1);
          }
        }
      });
    }
  }

  function addOrderItem(item) {
    const existing = orderState.find((entry) => entry.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      orderState.push({ ...item, quantity: 1 });
    }
    saveOrder();
    renderOrder();
  }

  function updateOrderQuantity(id, change) {
    const item = orderState.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
      removeOrderItem(id);
      return;
    }
    saveOrder();
    renderOrder();
  }

  function removeOrderItem(id) {
    const index = orderState.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      orderState.splice(index, 1);
      saveOrder();
      renderOrder();
    }
  }

  function renderOrder() {
    const orderItems = qs(selectors.orderItems);
    const subtotalEl = qs(selectors.orderSubtotal);
    const taxEl = qs(selectors.orderTax);
    const totalEl = qs(selectors.orderTotal);
    if (!orderItems || !subtotalEl || !taxEl || !totalEl) return;

    orderItems.innerHTML = "";

    if (!orderState.length) {
      orderItems.innerHTML = '<div class="order-empty">Your order is empty. Add a few dishes to build your tale.</div>';
    } else {
      orderState.forEach((item) => {
        const subtotal = item.price * item.quantity;
        const row = document.createElement("article");
        row.className = "order-item";
        row.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price)} each</p>
            <p><strong>${formatPrice(subtotal)}</strong></p>
          </div>
          <div class="qty-controls" aria-label="Quantity controls">
            <button type="button" class="qty-btn" data-qty-change="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <strong>${item.quantity}</strong>
            <button type="button" class="qty-btn" data-qty-change="1" data-id="${item.id}" aria-label="Increase quantity">+</button>
            <button type="button" class="remove-btn" data-remove-item="${item.id}" aria-label="Remove item">×</button>
          </div>
        `;
        orderItems.appendChild(row);
      });
    }

    const subtotal = orderState.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    subtotalEl.textContent = formatPrice(subtotal);
    taxEl.textContent = formatPrice(tax);
    totalEl.textContent = formatPrice(total);
  }

  function initMenuFilters() {
    const menuFilterGroup = qs('[data-filter-group="menu"]');
    const buttons = menuFilterGroup ? qsa(selectors.filterButton, menuFilterGroup) : [];
    if (!buttons.length) return;
    const items = qsa(selectors.filterItem);

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const filter = normalizeToken(button.dataset.filterButton);
        items.forEach((item) => {
          const matches = filter === "all" || normalizeToken(item.dataset.category) === filter;
          item.style.display = matches ? "" : "none";
          if (matches) {
            item.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "scale(1)" }], { duration: 220, easing: "ease-out" });
          }
        });
      });
    });
  }

  function initGallery() {
    const galleryItems = qsa(selectors.galleryItem);
    const filters = qsa(selectors.galleryFilterButton);
    const lightbox = qs(selectors.galleryLightbox);
    if (!galleryItems.length || !lightbox) return;

    galleryState.items = galleryItems.map((item) => ({
      title: item.dataset.title,
      image: item.dataset.image,
      category: item.dataset.category,
    }));

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => openLightbox(index));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        filters.forEach((entry) => entry.classList.remove("active"));
        button.classList.add("active");
        const filter = button.dataset.galleryFilter;
        galleryItems.forEach((item) => {
          const matches = filter === "all" || item.dataset.category === filter;
          item.style.display = matches ? "block" : "none";
        });
      });
    });

    const closeButton = qs(selectors.galleryLightboxClose);
    const prevButton = qs(selectors.galleryLightboxPrev);
    const nextButton = qs(selectors.galleryLightboxNext);

    closeButton?.addEventListener("click", closeLightbox);
    prevButton?.addEventListener("click", () => moveLightbox(-1));
    nextButton?.addEventListener("click", () => moveLightbox(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    });
  }

  function openLightbox(index) {
    const lightbox = qs(selectors.galleryLightbox);
    if (!lightbox || !galleryState.items.length) return;
    galleryState.currentIndex = index;
    updateLightbox();
    lightbox.classList.add("open");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    const lightbox = qs(selectors.galleryLightbox);
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  function moveLightbox(step) {
    if (!galleryState.items.length) return;
    galleryState.currentIndex = (galleryState.currentIndex + step + galleryState.items.length) % galleryState.items.length;
    updateLightbox();
  }

  function updateLightbox() {
    const current = galleryState.items[galleryState.currentIndex];
    const image = qs(selectors.galleryLightboxImg);
    const title = qs(selectors.galleryLightboxTitle);
    const counter = qs(selectors.galleryLightboxCounter);
    if (!current || !image || !title || !counter) return;
    image.src = current.image;
    image.alt = current.title;
    title.textContent = current.title;
    counter.textContent = `${galleryState.currentIndex + 1} / ${galleryState.items.length}`;
  }

  function initStats() {
    const counters = qsa(selectors.statCounter);
    if (!counters.length) return;

    counters.forEach((counter) => {
      const target = Number(counter.dataset.target || counter.textContent.replace(/\D/g, ""));
      const suffix = counter.dataset.suffix || "";
      counter.textContent = "0";

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(counter, target, suffix);
            observer.unobserve(counter);
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(counter);
    });
  }

  function animateCounter(el, target, suffix = "") {
    const duration = 1200;
    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * easeOutCubic(progress));
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  function initReservationForm() {
    const form = qs(selectors.reservationForm);
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errors = validateReservation(data);
      if (errors.length) {
        showToast(errors[0], "error");
        return;
      }
      const reservation = {
        ...data,
        guests: Number(data.guests),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(reservationStorageKey, JSON.stringify(reservation));
      renderReservationPreview();
      showToast("Your table has been reserved successfully!", "success");
      form.reset();
    });
  }

  function validateReservation(data) {
    const errors = [];
    if (!data.name?.trim()) errors.push("Full name is required.");
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push("Enter a valid email address.");
    if (!data.phone || !/^\+?[0-9\s-]{10,15}$/.test(data.phone)) errors.push("Enter a valid phone number.");
    if (!data.date) errors.push("Select a reservation date.");
    else {
      const selected = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(selected.getTime()) || selected < today) errors.push("Reservation date must be today or later.");
    }
    if (!data.time) errors.push("Select a reservation time.");
    const guests = Number(data.guests);
    if (!guests || guests < 1 || guests > 20) errors.push("Choose guests between 1 and 20.");
    return errors;
  }

  function renderReservationPreview() {
    const preview = qs(selectors.reservationPreview);
    if (!preview) return;
    const stored = localStorage.getItem(reservationStorageKey);
    if (!stored) {
      preview.innerHTML = '<div class="order-empty">No reservation saved yet. Your latest booking will appear here.</div>';
      return;
    }
    const reservation = JSON.parse(stored);
    preview.innerHTML = `
      <div class="reservation-status">
        <strong>${reservation.name}</strong><br>
        ${reservation.email}<br>
        ${reservation.phone}<br>
        ${reservation.date} at ${reservation.time}<br>
        Guests: ${reservation.guests}<br>
        <span class="badge" style="margin-top: 0.8rem;">Latest Reservation</span>
      </div>
    `;
  }

  function initContactForm() {
    const form = qs(selectors.contactForm);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name?.trim()) return showToast("Name is required.", "error");
      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) return showToast("Enter a valid email address.", "error");
      if (!data.subject?.trim()) return showToast("Subject is required.", "error");
      if (!data.message?.trim()) return showToast("Message is required.", "error");
      showToast("Message sent successfully. We will contact you soon.", "success");
      form.reset();
    });
  }

  function initActiveNav() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    qsa(".nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === currentPage || (currentPage === "" && href === "index.html");
      link.classList.toggle("active", isActive);
    });
  }

  function initParallax() {
    const hero = qs(".hero");
    if (!hero) return;
    window.addEventListener(
      "scroll",
      () => {
        const offset = window.scrollY * 0.15;
        hero.style.setProperty("--parallax-y", `${offset}px`);
        hero.style.setProperty("--hero-shift", `${offset * 0.2}px`);
        const before = hero.style.getPropertyValue("--hero-image");
        if (before) {
          hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
        }
      },
      { passive: true }
    );
  }
})();
