import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SongsService } from '../songs.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss'],
})
export class SongListComponent implements OnInit {
  // 取得した楽曲の配列
  public songs: any[] | undefined = undefined;

  // 楽曲の検索タイプ
  @Input()
  public searchType: 'keyword' | 'songName' | 'all' | 'none' = 'none';

  // 楽曲の並び替えタイプ
  @Input()
  public sortType: 'popular' | 'newer' | 'alphabetical' = 'popular';

  // 楽曲の検索パラメータ
  @Input()
  public searchParams: {
    keyword?: string;
    songName?: string;
    brandName?: string;
  };

  constructor(
    public songsService: SongsService,
    private sanitizer: DomSanitizer
  ) {}

  /**
   * コンポーネントが初期化されたときの処理
   */
  async ngOnInit(): Promise<void> {
    await this.search();
  }

  /**
   * 楽曲の検索パラメータによって検索処理を実行
   */
  public async search() {
    // キーワードがあれば、楽曲の検索処理を実行
    if (this.searchParams.keyword) {
      this.songs = await this.songsService.getSongsByKeyword(
        this.searchParams.keyword
      );
    }

    // 曲名があれば、楽曲の検索処理を実行
    if (this.searchParams.songName) {
      this.songs = await this.songsService.getSongsBySongName(
        this.searchParams.songName
      );
    }

    // ブランド名があれば、楽曲の検索処理を実行
    if (this.searchParams.brandName) {
      this.songs = await this.songsService.getSongsByBrandName(
        this.searchParams.brandName
      );
    }

    if (!this.songs) {
      return;
    }

    // 配信が新しい順にソート
    if (this.sortType == 'newer') {
      this.songs.sort((a, b) => {
        if (!a.damReleaseDate) return -1;
        if (!b.damReleaseDate) return 1;
        if (
          new Date(b.damReleaseDate).getTime() <
          new Date(a.damReleaseDate).getTime()
        )
          return -1;
        if (
          new Date(b.damReleaseDate).getTime() >
          new Date(a.damReleaseDate).getTime()
        )
          return 1;
        return 0;
      });
    }

    // 50音順にソート
    if (this.sortType == 'alphabetical') {
      this.songs.sort((a, b) => a.titleYomi.localeCompare(b.titleYomi, 'ja'));
    }
  }

  /**
   * デンモクアプリを起動するためのURLの取得
   * @param song 楽曲の配列
   * @returns デンモクアプリを起動するためのURL
   */
  public getReserveIntentUrl(song: { damRequestNo: string }) {
    const intentUrl = `denmoku://reserve?reqno=${song.damRequestNo.replace(
      /-/g,
      ''
    )}`;

    // 信頼のできるURLとしてマークして返す
    return this.sanitizer.bypassSecurityTrustUrl(intentUrl);
  }
}
