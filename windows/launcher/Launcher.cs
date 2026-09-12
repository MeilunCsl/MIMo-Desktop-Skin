using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

public sealed class DreamLauncher : Form {
  readonly WebView2 web = new WebView2();
  readonly Timer timer = new Timer { Interval = 100 };
  readonly string root, mode, port, preview;
  Process worker;
  Stopwatch elapsed = new Stopwatch();
  bool busy, finished, ticking;
  int capture;
  int lastProgressPct = 5;
  string lastProgressMsg = "starting";
  string output = "";
  [DllImport("user32.dll")] static extern bool ReleaseCapture();
  [DllImport("user32.dll")] static extern IntPtr SendMessage(IntPtr h, int m, IntPtr w, IntPtr l);
  public DreamLauncher(string root, string mode, string port, string preview) {
    this.root=root; this.mode=mode; this.port=port; this.preview=preview;
    Text="MiMo 皮肤启动器"; FormBorderStyle=FormBorderStyle.None;
    StartPosition=FormStartPosition.CenterScreen;
    AutoScaleMode=AutoScaleMode.Dpi;
    ClientSize=new Size(430,149); BackColor=Color.FromArgb(249,251,254);
    SizeChanged+=(s,e)=>RoundWindow();
    RoundWindow();
    var icon=Path.Combine(root,"logo","mimo.ico");
    if(File.Exists(icon)) Icon=new Icon(icon);
    web.Dock=DockStyle.Fill; Controls.Add(web);
    Shown+=async (s,e)=>await Initialize();
    timer.Tick+=async (s,e)=>await Tick();
    FormClosed+=(s,e)=>{timer.Stop();timer.Dispose();web.Dispose();};
  }
  void RoundWindow() {
    if(ClientSize.Width<36||ClientSize.Height<36)return;
    float diameter=20;
    using(var path=new System.Drawing.Drawing2D.GraphicsPath()) {
      float w=ClientSize.Width,h=ClientSize.Height;
      path.AddArc(0,0,diameter,diameter,180,90);
      path.AddArc(w-diameter,0,diameter,diameter,270,90);
      path.AddArc(w-diameter,h-diameter,diameter,diameter,0,90);
      path.AddArc(0,h-diameter,diameter,diameter,90,90);
      path.CloseFigure();
      var previous=Region;Region=new Region(path);
      if(previous!=null)previous.Dispose();
    }
  }
  async Task Initialize() {
    try {
      var env=await CoreWebView2Environment.CreateAsync(null,Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"MiMoDreamSkin","launcher-webview"));
      await web.EnsureCoreWebView2Async(env);
      web.CoreWebView2.Settings.AreDefaultContextMenusEnabled=false;
      web.CoreWebView2.Settings.AreDevToolsEnabled=false;
      web.CoreWebView2.Settings.IsStatusBarEnabled=false;
      web.CoreWebView2.WebMessageReceived+=(s,e)=>{
        if(new Uri(e.Source).IsFile) Message(e.TryGetWebMessageAsString());
      };
      web.CoreWebView2.NewWindowRequested+=(s,e)=>{e.Handled=true;};
      web.CoreWebView2.NavigationCompleted+=async(s,e)=>{
        if(!e.IsSuccess) { MessageBox.Show("启动页加载失败："+e.WebErrorStatus); Close();return; }
        if(!String.IsNullOrEmpty(preview)) {
          Directory.CreateDirectory(preview);
          await Snapshot("selection.png");
        }
        if(mode!="Ask") await web.ExecuteScriptAsync("LauncherUI.beginLaunch('"+mode+"')");
      };
      web.CoreWebView2.Navigate(new Uri(Path.Combine(root,"windows","assets","launcher.html")).AbsoluteUri);
    } catch(Exception e) {MessageBox.Show(e.Message,"启动器无法打开");Close();}
  }
  void Message(string message) {
    if(message=="drag"){ReleaseCapture();SendMessage(Handle,0xA1,new IntPtr(2),IntPtr.Zero);return;}
    if(message=="minimize"){WindowState=FormWindowState.Minimized;return;}
    if(message=="resize"){ClientSize=ClientSize.Width<520?new Size(580,149):new Size(430,149);return;}
    if(message=="close"){Close();return;}
    if(busy||message!="MiMo")return;
    busy=true;elapsed.Start();
    if(String.IsNullOrEmpty(preview)) {
      var info=new ProcessStartInfo {
        FileName=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),"WindowsPowerShell","v1.0","powershell.exe"),
        Arguments="-NoProfile -STA -ExecutionPolicy Bypass -File \""+Path.Combine(root,"Start-Codex.ps1")+"\" -Worker -Mode "+message+port,
        UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true,WorkingDirectory=root
      };
      worker=new Process {StartInfo=info};
      worker.OutputDataReceived+=(s,e)=>{if(e.Data!=null)lock(elapsed){output+=e.Data+"\n";ParseProgressLine(e.Data);}};
      worker.ErrorDataReceived+=(s,e)=>{if(e.Data!=null)lock(elapsed){output+=e.Data+"\n";ParseProgressLine(e.Data);}};
      try {worker.Start();worker.BeginOutputReadLine();worker.BeginErrorReadLine();}
      catch(Exception e){finished=true;web.ExecuteScriptAsync("LauncherUI.fail("+Json(e.Message)+")");}
    }
    if(!String.IsNullOrEmpty(preview)) {
      // Exercise a genuinely blocked worker while the UI keeps rendering.
      worker=Process.Start(new ProcessStartInfo {
        FileName=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),"WindowsPowerShell","v1.0","powershell.exe"),
        Arguments="-NoProfile -Command \"Start-Sleep -Seconds 8\"",
        UseShellExecute=false,CreateNoWindow=true
      });
    }
    timer.Start();
  }
  static string Json(string s) {return "\""+s.Replace("\\","\\\\").Replace("\"","\\\"").Replace("\r","\\r").Replace("\n","\\n")+"\"";}
  async Task Snapshot(string name) {
    using(var stream=File.Create(Path.Combine(preview,name)))
      await web.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
  }
  async Task Tick() {
    if(finished||web.IsDisposed||ticking)return;
    ticking=true;
    try { await UpdateProgress(); }
    catch(ObjectDisposedException) { }
    catch(InvalidOperationException) { if(!IsDisposed)throw; }
    finally { ticking=false; }
  }
  void ParseProgressLine(string line) {
    if(String.IsNullOrEmpty(line))return;
    // Expected: PROGRESS <0-100> <message...>
    if(!line.StartsWith("PROGRESS ",StringComparison.Ordinal))return;
    var parts=line.Substring(9).Trim().Split(new[]{' '},2);
    int pct;
    if(parts.Length==0||!int.TryParse(parts[0],out pct))return;
    if(pct<0)pct=0; if(pct>100)pct=100;
    lastProgressPct=pct;
    if(parts.Length>1&&!String.IsNullOrWhiteSpace(parts[1]))lastProgressMsg=parts[1].Trim();
  }
  async Task UpdateProgress() {
    double seconds=elapsed.Elapsed.TotalSeconds;
    bool done=worker!=null?worker.HasExited:seconds>=8;
    if(done) {
      finished=true;
      string log;lock(elapsed){log=output;}
      bool failed=worker!=null&&worker.ExitCode!=0;
      bool cancelled=log.IndexOf("cancelled",StringComparison.OrdinalIgnoreCase)>=0||log.Contains("取消");
      if(failed||cancelled) {
        string folder=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"MiMoDreamSkin");
        Directory.CreateDirectory(folder); File.WriteAllText(Path.Combine(folder,"launcher-last.log"),log);
        await web.ExecuteScriptAsync("LauncherUI.fail("+Json(cancelled?"启动已取消，请关闭后重试":"启动失败，请查看 launcher-last.log")+")");
      } else {
        await web.ExecuteScriptAsync("LauncherUI.setProgress(100,'启动完成')");
        await Task.Delay(900);
        if(IsDisposed)return;
        if(!String.IsNullOrEmpty(preview))await Snapshot("complete.png");
        Close();
      }
      timer.Stop();return;
    }
    // Real progress from PROGRESS marks emitted by Start-MiMo-Skin / inject-skin.
    // Only nudge upward while waiting if a stage has not reported yet.
    int pct=lastProgressPct;
    if(pct<8) pct=(int)Math.Min(8,5+seconds);
    if(pct>94) pct=94; // 100% is reserved for verified success
    string msg=lastProgressMsg;
    if(msg=="starting"||String.IsNullOrEmpty(msg)) msg="正在启动 · 等待就绪";
    await web.ExecuteScriptAsync("LauncherUI.setProgress("+pct+","+Json(msg)+")");
    if(!String.IsNullOrEmpty(preview)&&seconds>1+capture&&capture<3) {
      capture++;await Snapshot("motion-"+capture+".png");
      string metrics=await web.ExecuteScriptAsync("JSON.stringify({percent:document.getElementById('percent').textContent,animations:document.getAnimations().map(a=>({time:a.currentTime,state:a.playState})),canvas:document.getElementById('fx').toDataURL()})");
      File.WriteAllText(Path.Combine(preview,"motion-"+capture+".json"),metrics);
    }
  }
  public static void Run(string root,string mode,string port,string preview) {
    Application.EnableVisualStyles();
    Application.Run(new DreamLauncher(root,mode,port,preview));
  }
}
