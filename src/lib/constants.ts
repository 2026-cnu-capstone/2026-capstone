import type { McpCategory, NodeIO, DfxmlNode, StrategyStep, PlanStep } from '@/types';

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
];

export const DEFAULT_STRATEGY_STEPS: StrategyStep[] = [
  { id: 1, text: 'NTFS MFT 파싱 및 핵심 파일시스템 아티팩트 수집' },
  { id: 2, text: '비할당 영역 카빙으로 삭제 파일 복구' },
  { id: 3, text: '메타데이터 교차 검증으로 타임스탬프 이상 탐지' },
];

export const DEFAULT_PLAN: PlanStep[] = [
  { step: 1, name: '디스크 분석', mcp: 'Dissect MCP' },
  { step: 2, name: '삭제 파일 카빙', mcp: 'Scalpel MCP' },
  { step: 3, name: '메타데이터 추출', mcp: 'ExifTool MCP' },
];

export const NODE_IO: NodeIO[] = [
  {
    input: [{ name: 'USB_image.E01', type: 'E01 이미지', note: '2.3 GB · 무결성 검증됨' }],
    output: [
      { name: 'partition_map.json', type: 'JSON', note: '파티션 레이아웃' },
      { name: 'mft_records[]', type: 'Array', note: '1,247건' },
      { name: 'unallocated_sectors', type: 'Binary', note: '비할당 영역' },
    ],
    edgeLabel: 'partition_map · mft_records[]',
  },
  {
    input: [
      { name: 'partition_map.json', type: 'JSON', note: '이전 단계 출력' },
      { name: 'unallocated_sectors', type: 'Binary', note: '비할당 영역' },
    ],
    output: [
      { name: 'recovered_files[]', type: 'Array', note: '12건 · .hwp' },
      { name: 'carve_report.json', type: 'JSON', note: '카빙 결과 리포트' },
    ],
    edgeLabel: 'recovered_files[] · carve_report',
  },
  {
    input: [
      { name: 'recovered_files[]', type: 'Array', note: '12건' },
      { name: 'carve_report.json', type: 'JSON', note: '카빙 결과' },
    ],
    output: [
      { name: 'metadata_table.json', type: 'JSON', note: 'EXIF · 타임스탬프' },
      { name: 'flagged_files[]', type: 'Array', note: '변조 의심 2건' },
    ],
    edgeLabel: 'metadata_table · flagged_files[]',
  },
  {
    input: [
      { name: 'metadata_table.json', type: 'JSON', note: 'EXIF · 타임스탬프' },
      { name: 'mft_records[]', type: 'Array', note: '파일시스템 이벤트' },
    ],
    output: [
      { name: 'timeline.json', type: 'JSON', note: '이벤트 타임라인' },
      { name: 'anomaly_report.json', type: 'JSON', note: '이상 이벤트 목록' },
    ],
    edgeLabel: null,
  },
];

export const NODE_DFXML: DfxmlNode[] = [
  {
    name: '디스크 분석',
    input_xml: `<dfxml version="1.2">
  <source>
    <image_filename>USB_image.E01</image_filename>
    <image_size>2469606195</image_size>
    <hashdigest type="SHA-256">a3f2...8b91</hashdigest>
  </source>
</dfxml>`,
    output_xml: `<dfxml version="1.2">
  <volume>
    <ftype_str>NTFS</ftype_str>
    <block_size>4096</block_size>
    <first_block>0</first_block>
    <last_block>602783</last_block>
  </volume>
  <fileobject>
    <filename>$MFT</filename>
    <filesize>4096000</filesize>
    <mft_record_count>1247</mft_record_count>
  </fileobject>
</dfxml>`,
  },
  {
    name: '삭제 파일 카빙',
    input_xml: `<dfxml version="1.2">
  <source>
    <partition_map>
      <partition offset="1048576" length="2468352000"/>
    </partition_map>
    <unallocated_regions count="3847"/>
  </source>
</dfxml>`,
    output_xml: `<dfxml version="1.2">
  <fileobject>
    <filename>report_Q1.hwp</filename>
    <filesize>524288</filesize>
    <hashdigest type="MD5">3e2d...c9a1</hashdigest>
    <carve_method>header_footer</carve_method>
  </fileobject>
  <fileobject>
    <filename>confidential_memo.hwp</filename>
    <filesize>204800</filesize>
    <carve_method>header_footer</carve_method>
  </fileobject>
  <carve_summary total="12" format="hwp"/>
</dfxml>`,
  },
  {
    name: '메타데이터 추출',
    input_xml: `<dfxml version="1.2">
  <fileobject>
    <filename>report_Q1.hwp</filename>
    <filesize>524288</filesize>
  </fileobject>
  <carve_summary total="12"/>
</dfxml>`,
    output_xml: `<dfxml version="1.2">
  <fileobject>
    <filename>report_Q1.hwp</filename>
    <mtime>2024-03-15T09:22:11Z</mtime>
    <ctime>2024-03-15T09:22:11Z</ctime>
    <atime>2024-03-27T14:05:33Z</atime>
    <exif>
      <creator>박부장</creator>
      <software>HWP 2022</software>
    </exif>
    <flag>timestamp_anomaly</flag>
  </fileobject>
</dfxml>`,
  },
  {
    name: '타임라인 분석',
    input_xml: `<dfxml version="1.2">
  <metadata_table records="12"/>
  <mft_events total="1247"/>
</dfxml>`,
    output_xml: `<dfxml version="1.2">
  <timeline>
    <event ts="2024-03-15T09:22:11Z" type="create" file="report_Q1.hwp"/>
    <event ts="2024-03-20T18:44:02Z" type="modify" file="report_Q1.hwp"/>
    <event ts="2024-03-27T14:05:33Z" type="access" file="report_Q1.hwp"/>
    <anomaly type="timestamp_rollback" file="report_Q1.hwp"/>
  </timeline>
  <anomaly_count>2</anomaly_count>
</dfxml>`,
  },
];
