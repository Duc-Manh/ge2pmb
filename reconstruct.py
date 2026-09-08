import re

# 1. Read save.ejs
with open("/Users/ducmanh/Documents/3.Project/pmb/src/views/save.ejs", "r") as f:
    content = f.read()

# 2. Extract the user's updated calcProgress tbody from the diff provided in prompt
user_tbody = """          <tbody class="divide-y divide-slate-100 text-sm" id="projectListBody">
            <% if (typeof projects !=='undefined' && projects.length> 0) { %>
              <% projects.forEach(function(proj) { function calcProgress(scheduleStr) { if (!scheduleStr) return 0; try
                { const arr=typeof scheduleStr==='string' ? JSON.parse(scheduleStr) : scheduleStr; if
                (!Array.isArray(arr) || arr.length===0) return 0; let minStart=Infinity; let maxEnd=-Infinity;
                arr.forEach(item=> {
                if (item.start_time && item.end_time) {
                const s = new Date(item.start_time).getTime();
                const e = new Date(item.end_time).getTime();
                if (!isNaN(s) && s < minStart) minStart=s; if (!isNaN(e) && e> maxEnd) maxEnd = e;
                  }
                  });
                  if (minStart === Infinity || maxEnd === -Infinity || maxEnd <= minStart) return 0; const now=new
                    Date().getTime(); if (now <=minStart) return 0; if (now>= maxEnd) return 100;
                    const total = maxEnd - minStart;
                    const passed = now - minStart;
                    return Math.round((passed / total) * 100);
                    } catch(e) {
                    return 0;
                    }
                    }
                    const p1 = calcProgress(proj.schedule_level1);
                    const p2 = calcProgress(proj.schedule_level2);
                    const p3 = calcProgress(proj.schedule_level3);
                    %>
                    <tr class="hover:bg-slate-50/50 transition-colors group cursor-pointer project-row"
                      data-status="<%= proj.status %>">
                      <td class="px-6 py-4">
                        <div class="font-bold text-slate-800 group-hover:text-evnBlue transition-colors line-clamp-1">
                          <%= proj.project_name || proj.name %>
                        </div>
                        <div class="text-xs text-slate-500 mt-1 line-clamp-1">
                          <%= proj.contract_num || proj.unit_build || 'Không có mô tả' %>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <% if (proj.status==='Đang triển khai' ) { %>
                          <span
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-evnBlue border border-blue-100">
                            <span class="w-1.5 h-1.5 rounded-full bg-evnBlue animate-pulse"></span>
                            Đang triển khai
                          </span>
                          <% } else if (proj.status==='Chuẩn bị đầu tư' ) { %>
                            <span
                              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-evnOrange border border-orange-100">
                              <span class="w-1.5 h-1.5 rounded-full bg-evnOrange animate-pulse"></span>
                              Chuẩn bị đầu tư
                            </span>
                            <% } else if (proj.status==='Chậm tiến độ' ) { %>
                              <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Chậm tiến độ
                              </span>
                              <% } else if (proj.status==='Hoàn thành' ) { %>
                                <span
                                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                  Hoàn thành
                                </span>
                                <% } else { %>
                                  <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                                    <%= proj.status %>
                                  </span>
                                  <% } %>
                      </td>
                      <td class="px-6 py-4 min-w-[150px]">
                        <div class="flex justify-between text-xs mb-1">
                          <span class="font-bold <%= p1 > 0 ? 'text-evnBlue' : 'text-slate-500' %>">
                            <%= p1 %>%
                          </span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-gradient-to-r from-evnBlue to-blue-500 h-1.5 rounded-full"
                            style="width: <%= p1 %>%"></div>
                        </div>
                      </td>
                      <td class="px-6 py-4 min-w-[150px]">
                        <div class="flex justify-between text-xs mb-1">
                          <span class="font-bold <%= p2 > 0 ? 'text-evnOrange' : 'text-slate-500' %>">
                            <%= p2 %>%
                          </span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-gradient-to-r from-evnOrange to-orange-400 h-1.5 rounded-full"
                            style="width: <%= p2 %>%"></div>
                        </div>
                      </td>
                      <td class="px-6 py-4 min-w-[150px]">
                        <div class="flex justify-between text-xs mb-1">
                          <span class="font-bold <%= p3 > 0 ? 'text-emerald-500' : 'text-slate-500' %>">
                            <%= p3 %>%
                          </span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full"
                            style="width: <%= p3 %>%"></div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          class="px-3 py-1.5 bg-blue-50 text-evnBlue hover:bg-evnBlue hover:text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">Xem</button>
                      </td>
                    </tr>
                    <% }); %>
                      <% } else { %>
                        <tr>
                          <td colspan="6" class="text-center py-4 text-slate-500">Không có dữ liệu</td>
                        </tr>
                        <% } %>
          </tbody>"""

tbody_start = content.find('<tbody class="divide-y divide-slate-100 text-sm" id="projectListBody">')
tbody_end = content.find('</tbody>', tbody_start) + len('</tbody>')
content = content[:tbody_start] + user_tbody + content[tbody_end:]

# 3. Strip everything from <!-- Expanded Tracking Sections --> to the end of main!
expanded_start = content.find('<!-- Expanded Tracking Sections -->')
main_end = content.find('</main>')

# 4. Insert scratch_tasks.txt and scratch_last_replacement.txt before </main>
with open("scratch_tasks.txt", "r") as f:
    tasks = f.read()
with open("scratch_last_replacement.txt", "r") as f:
    docs = f.read()

# Since docs has </main> inside it, we just insert tasks and docs to replace the Expanded Tracking sections.
content = content[:expanded_start] + tasks + '\n' + docs

# Finally, write to project.ejs
with open("/Users/ducmanh/Documents/3.Project/pmb/src/views/project.ejs", "w") as f:
    f.write(content)

print("Reconstruction complete.")
