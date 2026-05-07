import type { Case, McpCategory, NodeIO, DfxmlNode, StrategyStep, PlanStep } from '@/types';

export const DEFAULT_CASES: Case[] = [
  { id: 'DF-2026-0425', title: '20260425_김영끌_랜섬웨어', status: 'running', analyst: '김영끌', media: 'NTFS', size: '50GB', date: '2026-04-25', progress: 45 },
  { id: 'DF-2023-0820', title: 'USB 저장매체 삭제파일 복구', status: 'done', analyst: '이포렌', media: 'NTFS', size: '2.3GB', date: '2023-08-20', progress: 100 },
  { id: 'DF-2023-0901', title: '이메일 피싱 계정 추적', status: 'idle', analyst: '박디지', media: 'Archive', size: '1.2GB', date: '2023-09-01', progress: 0 },
  { id: 'DF-2023-0910', title: '사내 기밀 유출 타임라인 분석', status: 'failed', analyst: '김수사', media: 'APFS', size: '256GB', date: '2023-09-10', progress: 12 },
];

export const MCP_TOOLS: McpCategory[] = [
  {
    category: '파일시스템 분석',
    tools: [
      { id: 'dissect', name: 'Dissect MCP', desc: '디스크 이미지 파티션 파싱 및 파일시스템 매핑' },
      { id: 'autopsy', name: 'Autopsy MCP', desc: '종합 디스크 포렌식 분석 자동화' },
    ],
  },
  {
    category: '삭제 파일 복구',
    tools: [
      { id: 'scalpel', name: 'Scalpel MCP', desc: '파일 시그니처 기반 비할당 영역 카빙' },
      { id: 'foremost', name: 'Foremost MCP', desc: '헤더/푸터 기반 파일 복구' },
    ],
  },
  {
    category: '메타데이터 추출',
    tools: [
      { id: 'exiftool', name: 'ExifTool MCP', desc: 'EXIF, IPTC, XMP 메타데이터 및 타임스탬프 추출' },
      { id: 'tika', name: 'Apache Tika MCP', desc: '다양한 포맷의 파일 메타데이터 파싱' },
    ],
  },
  {
    category: '메모리 분석',
    tools: [
      { id: 'volatility', name: 'Volatility MCP', desc: '메모리 덤프에서 프로세스·네트워크·아티팩트 추출' },
    ],
  },
  {
    category: '네트워크 분석',
    tools: [
      { id: 'wireshark', name: 'Wireshark MCP', desc: 'PCAP 파일 파싱 및 패킷 분석' },
      { id: 'networkminer', name: 'NetworkMiner MCP', desc: '네트워크 캡처에서 파일·세션 복원' },
    ],
  },
  {
    category: '레지스트리 / 브라우저',
    tools: [
      { id: 'regripper', name: 'RegRipper MCP', desc: 'Windows 레지스트리 아티팩트 추출' },
      { id: 'browserhistory', name: 'BrowserHistory MCP', desc: '브라우저 방문기록·다운로드·쿠키 분석' },
    ],
  },
  {
    category: '무결성 검증',
    tools: [
      { id: 'hashcheck', name: 'HashCheck MCP', desc: 'MD5/SHA-1/SHA-256 해시 일괄 검증' },
    ],
  },
  {
    category: '타임라인 분석',
    tools: [
      { id: 'plaso', name: 'Plaso MCP', desc: '다중 소스 타임라인 통합 및 이벤트 상관 분석' },
    ],
  },
];

export const DEFAULT_STRATEGY_STEPS: StrategyStep[] = [
  { id: 1, text: 'Registry (NTUSER.DAT): 최근 실행된 프로그램 및 랜섬웨어 실행 흔적 확인' },
  { id: 2, text: 'Event Log (Security.evtx): 비정상적인 로그인 시도 및 계정 사용 이력 확인' },
  { id: 3, text: 'Prefetch: 랜섬웨어 실행 파일 및 실행 시각 확인' },
  { id: 4, text: 'MFT: 파일 암호화 시점 및 파일 생성·삭제·수정 타임라인 재구성' },
  { id: 5, text: 'Shadow Copies: 삭제된 볼륨 섀도 복사본 확인' },
  { id: 6, text: 'Network Traffic Logs: 외부 서버와의 비정상적인 통신 이력 확인' },
  { id: 7, text: 'Scheduled Tasks: 자동 실행 설정된 랜섬웨어 확인' },
  { id: 8, text: 'Browser History: 랜섬웨어 다운로드 URL 및 관련 웹사이트 방문 기록 확인' },
  { id: 9, text: 'Email Artifacts: 피싱 이메일 및 첨부 파일 확인' },
  { id: 10, text: 'Installed Programs: 최근 설치된 의심스러운 프로그램 확인' },
];

export const DEFAULT_PLAN: PlanStep[] = [
  { step: 1, name: 'Registry 분석', mcp: 'Dissect MCP' },
  { step: 2, name: 'Event Log 분석', mcp: 'Dissect MCP' },
  { step: 3, name: 'Prefetch 분석', mcp: 'Dissect MCP' },
  { step: 4, name: 'MFT 타임라인', mcp: 'Dissect MCP' },
  { step: 5, name: 'Shadow Copies 분석', mcp: 'Dissect MCP' },
  { step: 6, name: 'Network Traffic 분석', mcp: 'Dissect MCP' },
  { step: 7, name: 'Scheduled Tasks 분석', mcp: 'Dissect MCP' },
  { step: 8, name: 'Browser History 분석', mcp: 'Dissect MCP' },
  { step: 9, name: 'Email Artifacts 분석', mcp: 'Dissect MCP' },
  { step: 10, name: 'Installed Programs 분석', mcp: 'Dissect MCP' },
];

export const NODE_IO: NodeIO[] = [
  // 1. Registry
  {
    input: [{ name: '2023_KDFS.E01', type: 'E01 이미지', note: '/Volumes/T7 Shield · NTFS' }],
    output: [
      { name: 'NTUSER.DAT', type: 'Registry Hive', note: '사용자별 레지스트리' },
      { name: 'suspect_executables', type: 'Array', note: 'svchost32.exe, encrypt_tool.exe' },
      { name: 'suspect_ts_range', type: 'String', note: '2023-09-15T02:30~02:35' },
    ],
    edgeLabel: '--users Admin · --ts-range 02:30~02:35',
  },
  // 2. Event Log
  {
    input: [
      { name: '--users', type: 'Arg', note: 'Registry에서 파싱된 의심 사용자' },
      { name: '--ts-range', type: 'Arg', note: '의심 실행 시각 범위' },
      { name: 'Security.evtx', type: 'EVTX', note: 'Windows Security 이벤트 로그' },
    ],
    output: [
      { name: 'logon_events', type: 'Array', note: 'Event ID 4624/4625 · 47건' },
      { name: 'anomaly_sessions', type: 'Array', note: '비정상 로그인 8건 · RDP(Type 10)' },
    ],
    edgeLabel: '--session-range 23:12~02:28 · --target-user Admin',
  },
  // 3. Prefetch
  {
    input: [
      { name: '--session-range', type: 'Arg', note: 'Event Log의 비정상 세션 시간대' },
      { name: '--target-user', type: 'Arg', note: '의심 계정명' },
      { name: 'Prefetch/*.pf', type: 'Prefetch Files', note: 'Windows Prefetch 디렉토리' },
    ],
    output: [
      { name: 'suspect_executables', type: 'Array', note: 'svchost32.exe, encrypt_tool.exe 외 1건' },
      { name: 'exec_timestamps', type: 'Array', note: '최초 실행 02:31:44 · 최종 02:35:08' },
    ],
    edgeLabel: '--executables svchost32.exe,encrypt_tool.exe · --since 02:31',
  },
  // 4. MFT
  {
    input: [
      { name: '--executables', type: 'Arg', note: 'Prefetch에서 확인된 의심 실행 파일' },
      { name: '--since', type: 'Arg', note: '최초 실행 시각 기준 필터' },
      { name: '$MFT', type: 'MFT Records', note: 'NTFS Master File Table' },
    ],
    output: [
      { name: 'encryption_events', type: 'Array', note: '암호화 시점 파일 변경 142건' },
      { name: 'mft_anomalies', type: 'Array', note: '$SI↔$FN 불일치 5건' },
      { name: 'encryption_window', type: 'String', note: '02:33:15~02:35:22' },
    ],
    edgeLabel: '--encryption-window 02:33~02:36 · --volume C:',
  },
  // 5. Shadow Copies
  {
    input: [
      { name: '--encryption-window', type: 'Arg', note: 'MFT에서 파싱된 암호화 시간대' },
      { name: '--volume', type: 'Arg', note: '대상 볼륨' },
      { name: 'VSS Catalog', type: 'VSS', note: '볼륨 섀도 복사본 카탈로그' },
    ],
    output: [
      { name: 'vss_snapshots', type: 'Array', note: '복원 가능 스냅샷 2건' },
      { name: 'deleted_vss', type: 'Array', note: '삭제된 VSS 3건 · vssadmin delete' },
    ],
    edgeLabel: '--attack-window 02:28~02:40 · --vss-delete-ts 02:36',
  },
  // 6. Network Traffic
  {
    input: [
      { name: '--attack-window', type: 'Arg', note: 'VSS 삭제 시점 포함 공격 시간대' },
      { name: '--vss-delete-ts', type: 'Arg', note: 'VSS 삭제 시각 (안티포렌식 기점)' },
      { name: 'network_logs/', type: 'Log Files', note: '방화벽·Sysmon 네트워크 로그' },
    ],
    output: [
      { name: 'c2_connections', type: 'Array', note: 'C2 서버 통신 12건' },
      { name: 'exfil_candidates', type: 'Array', note: '외부 전송 의심 4건 · 524KB' },
    ],
    edgeLabel: '--c2-ips 45.33.32.156 · --binary svchost32.exe',
  },
  // 7. Scheduled Tasks
  {
    input: [
      { name: '--c2-ips', type: 'Arg', note: 'Network에서 식별된 C2 서버 IP' },
      { name: '--binary', type: 'Arg', note: '랜섬웨어 실행 파일명' },
      { name: 'Tasks/*.xml', type: 'XML', note: 'Windows Task Scheduler 정의' },
    ],
    output: [
      { name: 'malicious_tasks', type: 'Array', note: '악성 자동실행 1건 · svchost32.exe' },
      { name: 'task_created_ts', type: 'String', note: '2023-09-15T02:34:00Z' },
    ],
    edgeLabel: '--action-path svchost32.exe · --created-after 09-14',
  },
  // 8. Browser History
  {
    input: [
      { name: '--action-path', type: 'Arg', note: 'Task에서 참조된 악성 바이너리 경로' },
      { name: '--created-after', type: 'Arg', note: '감염 추정 기준일' },
      { name: 'browser_data/', type: 'SQLite/JSON', note: 'Chrome·Edge 프로필 데이터' },
    ],
    output: [
      { name: 'suspect_downloads', type: 'Array', note: 'optimizer.zip 다운로드 1건' },
      { name: 'download_url', type: 'String', note: 'free-tools-download.xyz' },
    ],
    edgeLabel: '--url free-tools-download.xyz · --ts 09-14T18:22',
  },
  // 9. Email Artifacts
  {
    input: [
      { name: '--url', type: 'Arg', note: 'Browser에서 파싱된 다운로드 URL' },
      { name: '--ts', type: 'Arg', note: '다운로드 시각 (이전 메일 탐색 기준)' },
      { name: 'email_store/', type: 'PST/OST', note: 'Outlook 메일 저장소' },
    ],
    output: [
      { name: 'phishing_emails', type: 'Array', note: '피싱 이메일 2건' },
      { name: 'malicious_attachments', type: 'Array', note: '악성 첨부 1건 · security_patch.zip' },
    ],
    edgeLabel: '--attachment security_patch.zip · --since 09-14',
  },
  // 10. Installed Programs
  {
    input: [
      { name: '--attachment', type: 'Arg', note: 'Email에서 확인된 악성 첨부 파일명' },
      { name: '--since', type: 'Arg', note: '감염 기준일 이후 설치 프로그램 필터' },
      { name: 'SOFTWARE Hive', type: 'Registry Hive', note: 'HKLM\\SOFTWARE' },
    ],
    output: [
      { name: 'suspect_programs', type: 'Array', note: 'PC Optimizer Pro, svchost32 · 2건' },
      { name: 'install_chain', type: 'String', note: 'security_patch.zip → PCOptimizer → svchost32' },
    ],
    edgeLabel: null,
  },
];

export const NODE_DFXML: DfxmlNode[] = [
  {
    name: 'Registry 분석',
    xml: `<dfxml version="1.2">
  <source>
    <image_filename>2023_KDFS.E01</image_filename>
    <image_size>53687091200</image_size>
    <hashdigest type="SHA-256">7c4a...f2e1</hashdigest>
  </source>
  <target>
    <path>Users/Admin/NTUSER.DAT</path>
    <plugin>registry.ntuser.userassist</plugin>
    <plugin>registry.ntuser.runmru</plugin>
  </target>
  <artifact type="userassist">
    <entry name="svchost32.exe" run_count="14"
           last_run="2023-09-15T02:31:44Z"/>
    <entry name="encrypt_tool.exe" run_count="3"
           last_run="2023-09-15T02:33:12Z"/>
  </artifact>
  <artifact type="runmru">
    <entry value="cmd /c svchost32.exe -encrypt"
           timestamp="2023-09-15T02:30:55Z"/>
  </artifact>
  <summary suspect_traces="3"/>
</dfxml>`,
  },
  {
    name: 'Event Log 분석',
    xml: `<dfxml version="1.2">
  <source>
    <path>Windows/System32/winevt/Logs/Security.evtx</path>
    <filesize>71303168</filesize>
  </source>
  <filter>
    <event_id>4624</event_id>
    <event_id>4625</event_id>
  </filter>
  <eventlog source="Security.evtx">
    <event id="4625" ts="2023-09-14T23:12:07Z"
           logon_type="10" user="Admin"
           src_ip="192.168.1.105" status="failed"/>
    <event id="4624" ts="2023-09-15T02:28:33Z"
           logon_type="10" user="Admin"
           src_ip="192.168.1.105" status="success"/>
  </eventlog>
  <summary total="47" anomaly="8"/>
</dfxml>`,
  },
  {
    name: 'Prefetch 분석',
    xml: `<dfxml version="1.2">
  <source>
    <path>Windows/Prefetch/</path>
    <file_count>127</file_count>
  </source>
  <prefetch>
    <entry name="SVCHOST32.EXE-A1B2C3D4.pf"
           first_run="2023-09-15T02:31:44Z"
           last_run="2023-09-15T02:31:44Z"
           run_count="1"/>
    <entry name="ENCRYPT_TOOL.EXE-E5F6A7B8.pf"
           first_run="2023-09-15T02:33:12Z"
           last_run="2023-09-15T02:35:08Z"
           run_count="3"/>
  </prefetch>
  <summary suspect_executables="3"/>
</dfxml>`,
  },
  {
    name: 'MFT 타임라인',
    xml: `<dfxml version="1.2">
  <source>
    <path>$MFT</path>
    <record_count>48231</record_count>
  </source>
  <filter>
    <time_range start="2023-09-14T00:00:00Z"
                end="2023-09-16T00:00:00Z"/>
  </filter>
  <timeline>
    <event ts="2023-09-15T02:33:15Z" type="modify"
           file="Documents/report_2023.xlsx"
           ext_change=".xlsx → .xlsx.locked"/>
    <event ts="2023-09-15T02:33:18Z" type="create"
           file="Documents/README_DECRYPT.txt"/>
    <event ts="2023-09-15T02:35:22Z" type="modify"
           file="Pictures/family.jpg.locked"/>
  </timeline>
  <summary encryption_events="142" si_fn_mismatch="5"/>
</dfxml>`,
  },
  {
    name: 'Shadow Copies 분석',
    xml: `<dfxml version="1.2">
  <source>
    <vss_catalog>System Volume Information</vss_catalog>
  </source>
  <vss>
    <snapshot id="VSS-001"
              created="2023-09-10T04:00:00Z"
              status="available"/>
    <snapshot id="VSS-002"
              created="2023-09-13T04:00:00Z"
              status="available"/>
    <deleted_snapshot id="VSS-003"
              created="2023-09-14T04:00:00Z"
              deleted_at="2023-09-15T02:36:01Z"/>
    <deleted_snapshot id="VSS-004"
              created="2023-09-15T00:00:00Z"
              deleted_at="2023-09-15T02:36:01Z"/>
    <deleted_snapshot id="VSS-005"
              created="2023-09-15T02:00:00Z"
              deleted_at="2023-09-15T02:36:01Z"/>
    <delete_command>vssadmin delete shadows /all</delete_command>
  </vss>
  <summary available="2" deleted="3"/>
</dfxml>`,
  },
  {
    name: 'Network Traffic 분석',
    xml: `<dfxml version="1.2">
  <source>
    <path>network_logs/</path>
    <firewall_log>pfirewall.log</firewall_log>
    <event_source>Microsoft-Windows-Sysmon</event_source>
  </source>
  <network>
    <connection ts="2023-09-15T02:29:11Z"
                src="192.168.1.50" dst="45.33.32.156"
                port="443" proto="TCP"
                tag="c2_beacon"/>
    <connection ts="2023-09-15T02:36:44Z"
                src="192.168.1.50" dst="185.220.101.34"
                port="8443" bytes_out="524288"
                tag="exfiltration_suspect"/>
  </network>
  <summary c2_connections="12" exfil_candidates="4"/>
</dfxml>`,
  },
  {
    name: 'Scheduled Tasks 분석',
    xml: `<dfxml version="1.2">
  <source>
    <path>Windows/System32/Tasks/</path>
    <task_count>34</task_count>
  </source>
  <tasks>
    <task name="WindowsUpdateCheck"
          created="2023-09-15T02:34:00Z"
          trigger="DAILY 02:00"
          action="cmd /c C:\\Users\\Admin\\svchost32.exe"
          tag="malicious"/>
  </tasks>
  <summary total="34" malicious="1"/>
</dfxml>`,
  },
  {
    name: 'Browser History 분석',
    xml: `<dfxml version="1.2">
  <source>
    <path>Users/Admin/AppData/Local/Google/Chrome/User Data/Default/History</path>
    <format>SQLite</format>
  </source>
  <browser type="Chrome">
    <visit url="https://free-tools-download.xyz/optimizer.zip"
           ts="2023-09-14T18:22:31Z"
           title="Free PC Optimizer"/>
    <download url="https://free-tools-download.xyz/optimizer.zip"
              ts="2023-09-14T18:22:45Z"
              path="Downloads/optimizer.zip"
              size="2458624"/>
  </browser>
  <summary total_visits="2341" suspect_downloads="1"/>
</dfxml>`,
  },
  {
    name: 'Email Artifacts 분석',
    xml: `<dfxml version="1.2">
  <source>
    <path>Users/Admin/AppData/Local/Microsoft/Outlook/admin@company.ost</path>
    <format>OST</format>
  </source>
  <email>
    <message ts="2023-09-14T16:30:00Z"
             from="hr-notice@company-portal.net"
             subject="연봉 조정 안내"
             tag="phishing"
             body_link="https://free-tools-download.xyz"/>
    <message ts="2023-09-14T17:45:12Z"
             from="support@ms-security-alert.com"
             subject="긴급: 보안 업데이트 필요"
             tag="phishing">
      <attachment name="security_patch.zip"
                  size="1048576"
                  sha256="b7e3...9d42"
                  tag="malicious"/>
    </message>
  </email>
  <summary phishing="2" malicious_attachments="1"/>
</dfxml>`,
  },
  {
    name: 'Installed Programs 분석',
    xml: `<dfxml version="1.2">
  <source>
    <hive>SOFTWARE</hive>
    <key>Microsoft\\Windows\\CurrentVersion\\Uninstall</key>
  </source>
  <programs>
    <program name="PC Optimizer Pro"
             install_date="2023-09-14"
             publisher="Unknown"
             path="C:\\Program Files\\PCOptimizer\\"
             tag="suspect"/>
    <program name="svchost32"
             install_date="2023-09-15"
             publisher=""
             path="C:\\Users\\Admin\\"
             tag="malicious"/>
  </programs>
  <summary total="87" suspect="2"/>
</dfxml>`,
  },
];
