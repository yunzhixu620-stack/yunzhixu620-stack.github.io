(function () {
  "use strict";

  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const statuses = ["全部", "可用产品", "MVP", "交互原型", "实验", "已归档"];
  const state = { status: "全部", category: "", query: "", sort: "priority" };

  const els = {
    grid: document.getElementById("projectGrid"),
    search: document.getElementById("searchInput"),
    statusFilters: document.getElementById("statusFilters"),
    category: document.getElementById("categorySelect"),
    sort: document.getElementById("sortSelect"),
    summary: document.getElementById("resultSummary"),
    metrics: document.getElementById("statusMetrics"),
    empty: document.getElementById("emptyState"),
    modal: document.getElementById("projectModal"),
    modalPanel: document.getElementById("modalPanel")
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const statusClass = (status) => ({
    "可用产品": "usable", "MVP": "mvp", "交互原型": "prototype", "实验": "experiment", "已归档": "archived"
  })[status] || "default";

  function renderMetrics() {
    const order = ["可用产品", "MVP", "交互原型", "实验", "已归档"];
    const total = projects.length || 1;
    const counts = Object.fromEntries(order.map((status) => [status, projects.filter((p) => p.status === status).length]));
    const shippable = counts["可用产品"] + counts.MVP;
    const shippablePct = Math.round((shippable / total) * 100);

    const segments = order.map((status) => {
      const count = counts[status];
      if (!count) return "";
      const pct = (count / total) * 100;
      const showLabel = pct >= 14;
      const isActive = state.status === status;
      const isDim = state.status !== "全部" && !isActive;
      return `<button class="track-seg ${statusClass(status)}${isActive ? " active" : ""}${isDim ? " dim" : ""}" type="button"
        style="flex: ${count} 1 0;"
        data-status="${escapeHtml(status)}"
        aria-label="${escapeHtml(status)} ${count} 项，占 ${pct.toFixed(0)}%"
        title="${escapeHtml(status)} · ${count} 项 · ${pct.toFixed(0)}%">
        <span class="track-count">${count}</span>${showLabel ? `<span class="track-name">${escapeHtml(status)}</span>` : ""}
      </button>`;
    }).join("");

    const legend = order.map((status) => `
      <li class="legend-item">
        <span class="legend-swatch ${statusClass(status)}"></span>
        <span class="legend-label">${escapeHtml(status)}</span>
        <span class="legend-count">${counts[status]}</span>
      </li>`).join("");

    els.metrics.innerHTML = `
      <div class="snapshot-headline">
        <div class="snapshot-figure"><strong>${projects.length}</strong><span>个项目 · 5 档状态</span></div>
        <div class="snapshot-readiness">
          <span class="readiness-label">可上线 / 可验证</span>
          <span class="readiness-value">${shippable}<em>/${total}</em></span>
        </div>
      </div>
      <div class="status-track" role="group" aria-label="项目状态分布">${segments}</div>
      <div class="readiness-bar" role="img" aria-label="可上线与可验证项目占比 ${shippablePct}%">
        <div class="readiness-fill" style="width: ${shippablePct}%"></div>
        <div class="readiness-scale" aria-hidden="true"><span>可交付边界</span><span>${shippablePct}%</span></div>
      </div>
      <ul class="status-legend">${legend}</ul>`;

    els.metrics.querySelectorAll(".track-seg").forEach((seg) => {
      seg.addEventListener("click", () => applyQuickFilter("status", seg.dataset.status));
    });
  }

  function renderFilters() {
    els.statusFilters.innerHTML = statuses.map((status) => {
      const count = status === "全部" ? projects.length : projects.filter((p) => p.status === status).length;
      return `<button class="filter-chip${status === state.status ? " active" : ""}" type="button" data-status="${escapeHtml(status)}">${escapeHtml(status)} <span>${count}</span></button>`;
    }).join("");

    const categories = [...new Set(projects.map((p) => p.category))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    els.category.innerHTML = `<option value="">全部方向</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  }

  function filteredProjects() {
    const query = state.query.toLocaleLowerCase("zh-CN");
    const list = projects.filter((project) => {
      const haystack = [project.name, project.tagline, project.summary, project.category, project.status, ...(project.capabilities || [])].join(" ").toLocaleLowerCase("zh-CN");
      return (state.status === "全部" || project.status === state.status)
        && (!state.category || project.category === state.category)
        && (!query || haystack.includes(query));
    });

    return list.sort((a, b) => {
      if (state.sort === "new") return b.updated.localeCompare(a.updated);
      if (state.sort === "name") return a.name.localeCompare(b.name, "zh-CN");
      return a.priority - b.priority;
    });
  }

  function projectCard(project, index) {
    const image = project.cover
      ? `<img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.name)} 页面预览" loading="lazy">`
      : `<div class="cover-placeholder">${escapeHtml(project.name.charAt(0))}</div>`;
    const action = project.demo ? "在线体验" : "查看代码";
    return `<article class="project-card" data-project="${escapeHtml(project.id)}" tabindex="0" style="--delay:${index * 35}ms">
      <div class="card-cover">${image}<span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span></div>
      <div class="card-body">
        <div class="card-kicker"><span>${escapeHtml(project.category)}</span><time datetime="${escapeHtml(project.updated)}">${escapeHtml(project.updated.slice(0, 7))}</time></div>
        <h3>${escapeHtml(project.name)}</h3>
        <p class="card-tagline">${escapeHtml(project.tagline)}</p>
        <p class="card-summary">${escapeHtml(project.summary)}</p>
        <div class="capability-list">${project.capabilities.slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <div class="card-footer"><span>查看边界与下一步</span><strong>${action} ↗</strong></div>
      </div>
    </article>`;
  }

  function render() {
    const list = filteredProjects();
    els.grid.innerHTML = list.map(projectCard).join("");
    els.summary.textContent = `显示 ${list.length} / ${projects.length} 个项目`;
    els.empty.classList.toggle("hidden", list.length > 0);
    els.grid.classList.toggle("hidden", list.length === 0);
    document.querySelectorAll(".filter-chip").forEach((button) => button.classList.toggle("active", button.dataset.status === state.status));
    renderMetrics();

    els.grid.querySelectorAll(".project-card").forEach((card) => {
      const open = () => openProject(card.dataset.project, true);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
    });
  }

  function listHtml(items) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function openProject(id, updateHash) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    const primaryUrl = project.demo || project.repo;
    const primaryLabel = project.demo ? "在线体验" : "查看代码";
    els.modalPanel.innerHTML = `
      <button class="modal-close" type="button" aria-label="关闭" data-close-modal>×</button>
      <div class="modal-cover"><img src="${escapeHtml(project.cover)}" alt=""><span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span></div>
      <div class="modal-content">
        <div class="card-kicker"><span>${escapeHtml(project.category)}</span><time>${escapeHtml(project.updated)}</time></div>
        <h2 id="modalTitle">${escapeHtml(project.name)}</h2>
        <p class="modal-tagline">${escapeHtml(project.tagline)}</p>
        <p class="modal-summary">${escapeHtml(project.summary)}</p>
        <div class="modal-capabilities">${project.capabilities.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <section><h3>已经成立的部分</h3>${listHtml(project.working)}</section>
        <section class="boundary-callout"><h3>当前边界</h3><p>${escapeHtml(project.boundary)}</p></section>
        ${project.compliance ? `<section class="compliance-callout"><h3>合规、授权与隐私</h3><p>${escapeHtml(project.compliance)}</p></section>` : ""}
        <section><h3>下一步优先级</h3>${listHtml(project.next)}</section>
        <div class="modal-actions">
          <a class="primary-button" href="${escapeHtml(primaryUrl)}" target="_blank" rel="noopener">${primaryLabel} ↗</a>
          <a class="ghost-button" href="${escapeHtml(project.repo)}" target="_blank" rel="noopener">GitHub 仓库 ↗</a>
        </div>
      </div>`;
    els.modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    els.modalPanel.querySelector(".modal-close").focus();
    if (updateHash) history.replaceState(null, "", `#project=${project.id}`);
  }

  function closeModal(updateHash = true) {
    els.modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
    if (updateHash && location.hash.startsWith("#project=")) history.replaceState(null, "", location.pathname + location.search);
  }

  function openMethod() {
    const definitions = [
      ["可用产品", "核心任务可以真实完成，公开承诺与实际能力基本一致。"],
      ["MVP", "核心闭环可以验证，但真实服务、协作、内容深度或外部验证仍有重要缺口。"],
      ["交互原型", "用于展示产品流程和业务判断；可点击不等于已经具备生产能力。"],
      ["实验", "用于验证交互、技术或内容表达，不承诺稳定性和持续维护。"],
      ["已归档", "不再作为当前主产品维护，仅保留演进记录并指向替代产品。"]
    ];
    els.modalPanel.innerHTML = `
      <button class="modal-close" type="button" aria-label="关闭" data-close-modal>×</button>
      <div class="modal-content method-content">
        <p class="eyebrow">STATUS MODEL</p>
        <h2 id="modalTitle">五种状态，只描述当前交付能力。</h2>
        <p class="modal-summary">状态不根据页面是否好看判断，也不代表项目重要程度。升级状态必须同时更新公开目录和项目自身说明。</p>
        <div class="method-list">${definitions.map(([status, description]) => `<section><span class="status-badge ${statusClass(status)}">${status}</span><p>${description}</p></section>`).join("")}</div>
        <a class="text-link" href="docs/STATUS_MODEL.md" target="_blank" rel="noopener">阅读完整升级条件 →</a>
      </div>`;
    els.modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    els.modalPanel.querySelector(".modal-close").focus();
  }

  function applyQuickFilter(type, value) {
    if (type === "category") { state.category = value; els.category.value = value; }
    if (type === "status") state.status = value;
    render();
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
  }

  els.statusFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-status]");
    if (!button) return;
    state.status = button.dataset.status;
    render();
  });
  els.category.addEventListener("change", () => { state.category = els.category.value; render(); });
  els.sort.addEventListener("change", () => { state.sort = els.sort.value; render(); });
  els.search.addEventListener("input", () => { state.query = els.search.value.trim(); render(); });
  document.getElementById("clearFilters").addEventListener("click", () => {
    Object.assign(state, { status: "全部", category: "", query: "", sort: "priority" });
    els.search.value = ""; els.category.value = ""; els.sort.value = "priority"; render();
  });
  document.querySelectorAll(".path-card[data-category]").forEach((button) => button.addEventListener("click", () => applyQuickFilter("category", button.dataset.category)));
  document.querySelectorAll(".path-card[data-status]").forEach((button) => button.addEventListener("click", () => applyQuickFilter("status", button.dataset.status)));
  els.modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal]")) closeModal();
  });
  document.getElementById("methodButton").addEventListener("click", openMethod);
  window.addEventListener("hashchange", () => {
    if (location.hash.startsWith("#project=")) openProject(location.hash.slice(9), false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.modal.classList.contains("hidden")) closeModal();
    if (event.key === "/" && document.activeElement !== els.search) { event.preventDefault(); els.search.focus(); }
  });

  renderMetrics();
  renderFilters();
  render();
  if (location.hash.startsWith("#project=")) openProject(location.hash.slice(9), false);
})();
